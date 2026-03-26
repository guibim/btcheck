# scripts/scrape.py
import hashlib
import math
import os
from datetime import datetime, timedelta
from zoneinfo import ZoneInfo

from dateutil import parser as dateparser
import feedparser
from bs4 import BeautifulSoup
import psycopg


# ===================== Configurações =====================
SOURCES = [
    # PT-BR
    {"name": "Livecoins",             "url": "https://livecoins.com.br/feed/",                    "lang": "pt-BR"},
    {"name": "Cointelegraph Brasil",  "url": "https://br.cointelegraph.com/rss",                   "lang": "pt-BR"},
    {"name": "Portal do Bitcoin",     "url": "https://portaldobitcoin.uol.com.br/feed/",           "lang": "pt-BR"},
    {"name": "BeInCrypto Brasil",     "url": "https://br.beincrypto.com/feed/",                    "lang": "pt-BR"},
    {"name": "CriptoFácil",           "url": "https://www.criptofacil.com/feed/",                  "lang": "pt-BR"},

    # EN
    {"name": "CoinDesk",              "url": "https://www.coindesk.com/arc/outboundfeeds/rss/?outputType=xml", "lang": "en"},
    {"name": "Cointelegraph (EN)",    "url": "https://cointelegraph.com/rss",                      "lang": "en"},
    {"name": "CryptoSlate",           "url": "https://cryptoslate.com/feed/",                      "lang": "en"},
    {"name": "CryptoPotato",          "url": "https://cryptopotato.com/feed/",                     "lang": "en"},
    {"name": "The Defiant",           "url": "https://thedefiant.io/feed/",                        "lang": "en"},
    {"name": "Bitcoinist",            "url": "https://bitcoinist.com/feed/",                       "lang": "en"},
    {"name": "Bitcoin Magazine",      "url": "https://bitcoinmagazine.com/feed",                   "lang": "en"},
    {"name": "Decrypt",               "url": "https://decrypt.co/feed",                            "lang": "en"},
    {"name": "NewsBTC",               "url": "https://www.newsbtc.com/feed/",                      "lang": "en"},
]

RAW_DB_URL = os.environ.get("DATABASE_URL", "").strip()
if not RAW_DB_URL:
    raise SystemExit("DATABASE_URL não definida (configure em Settings → Secrets → Actions).")

DATABASE_URL = (
    RAW_DB_URL if "sslmode=" in RAW_DB_URL
    else (RAW_DB_URL + ("&sslmode=require" if "?" in RAW_DB_URL else "?sslmode=require"))
)

MAX_DAILY = int(os.environ.get("MAX_DAILY_INSERTS", "20"))
TZ  = ZoneInfo(os.environ.get("TZ", "America/Sao_Paulo"))
UTC = ZoneInfo("UTC")

# Palavras-chave e pesos — cobrem PT-BR e EN
KEYWORD_WEIGHTS: dict[str, float] = {
    # Termos universais (símbolo/nome)
    "bitcoin":     3.0,
    "btc":         2.5,
    # Tecnologia
    "blockchain":  1.5,
    "lightning":   1.2,
    "halving":     1.0,
    # Mercado / finanças
    "etf":         1.2,
    "market":      0.8,
    "mercado":     0.8,
    "price":       0.7,
    "preço":       0.7,
    # Regulação
    "regulation":  0.8,
    "regulacao":   0.8,
    "regulação":   0.8,
    # Mineração
    "mining":      0.7,
    "mineracao":   0.6,
    "mineração":   0.6,
    # Adoção
    "adoption":    0.6,
    "institutional": 0.6,
}

SOURCE_WEIGHTS: dict[str, float] = {
    # PT-BR
    "Cointelegraph Brasil": 1.0,
    "Portal do Bitcoin":    0.9,
    "BeInCrypto Brasil":    0.8,
    "Livecoins":            0.7,
    "CriptoFácil":          0.6,

    # EN
    "CoinDesk":             1.0,
    "Cointelegraph (EN)":   0.9,
    "Bitcoin Magazine":     0.9,
    "CryptoSlate":          0.8,
    "The Defiant":          0.8,
    "Decrypt":              0.7,
    "Bitcoinist":           0.7,
    "NewsBTC":              0.6,
    "CryptoPotato":         0.6,
}

RECENCY_HALFLIFE_HOURS = 36
RECENCY_WEIGHT = 2.0


# ===================== Funções auxiliares =====================
def url_hash(url: str) -> str:
    return hashlib.sha256(url.strip().encode()).hexdigest()


def clean_html(html: str | None) -> str:
    return BeautifulSoup(html or "", "html.parser").get_text().strip()


def normalize_to_utc(dt: datetime) -> datetime:
    if dt.tzinfo is None:
        dt = dt.replace(tzinfo=TZ)
    return dt.astimezone(UTC)


def parse_feed(name: str, url: str, lang: str) -> list[dict]:
    feed = feedparser.parse(url)
    items: list[dict] = []

    for e in feed.entries:
        link = e.get("link")
        if not link:
            continue

        title       = (e.get("title") or "").strip()
        summary     = clean_html(e.get("summary") or e.get("description") or "")
        published_raw = e.get("published") or e.get("updated")

        if published_raw:
            try:
                published_at = dateparser.parse(published_raw)
            except Exception:
                published_at = datetime.now(UTC)
        else:
            published_at = datetime.now(UTC)

        published_at = normalize_to_utc(published_at)

        items.append({
            "id":           url_hash(link),
            "source":       name,
            "lang":         lang,
            "title":        title,
            "url":          link,
            "summary":      summary,
            "published_at": published_at,
        })

    return items


def compute_relevance(item: dict) -> float:
    base_text = f"{item.get('title', '')} {item.get('summary', '')}".lower()

    keyword_score = 0.0
    for kw, weight in KEYWORD_WEIGHTS.items():
        occurrences = base_text.count(kw)
        if occurrences:
            keyword_score += occurrences * weight

    source_score = SOURCE_WEIGHTS.get(item.get("source", ""), 0.0)

    published_at = item.get("published_at")
    if isinstance(published_at, datetime):
        elapsed_hours = max(
            0.0,
            (datetime.now(UTC) - published_at.astimezone(UTC)).total_seconds() / 3600,
        )
        recency_score = math.exp(-elapsed_hours / RECENCY_HALFLIFE_HOURS) * RECENCY_WEIGHT
    else:
        recency_score = 0.0

    return round(keyword_score + source_score + recency_score, 4)


def get_today_bounds_sao_paulo() -> tuple[datetime, datetime]:
    now_sp = datetime.now(TZ)
    start  = now_sp.replace(hour=0, minute=0, second=0, microsecond=0)
    end    = start + timedelta(days=1)
    return (start.astimezone(UTC), end.astimezone(UTC))


def get_remaining_for_lang(conn, lang: str, start_utc: datetime, end_utc: datetime) -> int:
    """Retorna quantos artigos ainda cabem hoje para o idioma dado."""
    cur = conn.execute(
        "SELECT COUNT(*) FROM articles WHERE lang = %s AND published_at >= %s AND published_at < %s",
        (lang, start_utc, end_utc),
    )
    already = cur.fetchone()[0]
    return max(0, MAX_DAILY - already)


# ===================== Execução principal =====================
def main():
    all_items: list[dict] = []
    for s in SOURCES:
        all_items.extend(parse_feed(s["name"], s["url"], s["lang"]))

    # Foco estrito em Bitcoin/BTC
    KEYWORDS = ("bitcoin", "btc")
    all_items = [
        it for it in all_items
        if any(k in (it["title"] + " " + (it["summary"] or "")).lower() for k in KEYWORDS)
    ]

    # Ordena por data (UTC)
    all_items.sort(key=lambda x: x["published_at"], reverse=True)

    with psycopg.connect(DATABASE_URL) as conn:
        # Garante estrutura do banco (idempotente) — um execute por statement
        conn.execute("""
            CREATE TABLE IF NOT EXISTS articles (
                id              TEXT PRIMARY KEY,
                source          TEXT NOT NULL,
                title           TEXT NOT NULL,
                url             TEXT NOT NULL,
                summary         TEXT,
                published_at    TIMESTAMPTZ NOT NULL,
                relevance_score REAL NOT NULL DEFAULT 0,
                created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
                lang            TEXT NOT NULL DEFAULT 'pt-BR'
            )
        """)
        conn.execute(
            "ALTER TABLE articles ADD COLUMN IF NOT EXISTS relevance_score REAL NOT NULL DEFAULT 0"
        )
        conn.execute(
            "ALTER TABLE articles ADD COLUMN IF NOT EXISTS lang TEXT NOT NULL DEFAULT 'pt-BR'"
        )
        conn.execute(
            "CREATE INDEX IF NOT EXISTS idx_articles_published_at ON articles (published_at DESC)"
        )
        conn.execute(
            "CREATE INDEX IF NOT EXISTS idx_articles_lang ON articles (lang)"
        )

        # Backfill: fontes EN que já estavam no banco como 'pt-BR'
        conn.execute("""
            UPDATE articles SET lang = 'en'
            WHERE source IN (
                'CoinDesk', 'Cointelegraph (EN)', 'CryptoSlate',
                'CryptoPotato', 'The Defiant', 'Bitcoinist',
                'Bitcoin Magazine', 'Decrypt', 'NewsBTC'
            ) AND lang = 'pt-BR';
        """)

        start_utc, end_utc = get_today_bounds_sao_paulo()

        # Agrupa candidatos por idioma e respeita limite diário por idioma
        by_lang: dict[str, list[dict]] = {"pt-BR": [], "en": []}
        for it in all_items:
            by_lang.setdefault(it["lang"], []).append(it)

        # Deduplica globalmente por id
        all_ids = tuple(set(it["id"] for it in all_items))
        existing: set[str] = set()
        if all_ids:
            for i in range(0, len(all_ids), 500):
                batch = all_ids[i:i + 500]
                placeholders = ",".join(["%s"] * len(batch))
                cur = conn.execute(
                    f"SELECT id FROM articles WHERE id IN ({placeholders})", batch
                )
                existing.update(row[0] for row in cur.fetchall())

        total_inserted = 0
        for lang, items in by_lang.items():
            remaining = get_remaining_for_lang(conn, lang, start_utc, end_utc)
            if remaining == 0:
                print(f"[{lang}] Limite diário ({MAX_DAILY}) já atingido.")
                continue

            candidates = [
                it for it in items
                if (it["id"] not in existing)
                and (start_utc <= it["published_at"] < end_utc)
            ]

            for item in candidates:
                item["relevance_score"] = compute_relevance(item)

            to_insert = candidates[:remaining]
            if not to_insert:
                print(f"[{lang}] Sem itens novos dentro do período de hoje.")
                continue

            with conn.cursor() as cur:
                cur.executemany(
                    """
                    INSERT INTO articles
                        (id, source, lang, title, url, summary, published_at, relevance_score)
                    VALUES
                        (%(id)s, %(source)s, %(lang)s, %(title)s, %(url)s,
                         %(summary)s, %(published_at)s, %(relevance_score)s)
                    ON CONFLICT (id) DO NOTHING
                    """,
                    to_insert,
                )
            existing.update(it["id"] for it in to_insert)
            total_inserted += len(to_insert)
            print(f"[{lang}] Inseridos {len(to_insert)} artigos (limite diário: {MAX_DAILY}).")

        if total_inserted == 0:
            print("Nenhum artigo novo inserido.")


if __name__ == "__main__":
    main()
