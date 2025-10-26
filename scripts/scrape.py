import hashlib
import os
from datetime import datetime, timedelta
from zoneinfo import ZoneInfo
from dateutil import parser as dateparser
import feedparser
from bs4 import BeautifulSoup
import psycopg

# ===================== Configurações =====================
SOURCES = [
    {"name": "InfoMoney Cripto", "url": "https://www.infomoney.com.br/crypto/feed/"},
    {"name": "Exame Cripto", "url": "https://exame.com/cripto/feed/"},
    {"name": "Livecoins", "url": "https://livecoins.com.br/feed/"},
    {"name": "Cointelegraph Brasil", "url": "https://br.cointelegraph.com/rss"},
    {"name": "Portal do Bitcoin", "url": "https://portaldobitcoin.uol.com.br/feed/"},
]

DATABASE_URL = os.environ.get("DATABASE_URL")
MAX_DAILY = int(os.environ.get("MAX_DAILY_INSERTS", "10"))
TZ = ZoneInfo(os.environ.get("TZ", "America/Sao_Paulo"))

# ===================== Funções auxiliares =====================

def url_hash(url: str) -> str:
    """Gera hash SHA-256 da URL para evitar duplicações."""
    return hashlib.sha256(url.strip().encode()).hexdigest()


def clean_html(html: str | None) -> str:
    """Remove tags HTML e deixa apenas texto limpo."""
    return BeautifulSoup(html or "", "html.parser").get_text().strip()


def parse_feed(name: str, url: str) -> list[dict]:
    """Lê um feed RSS e retorna lista de notícias formatadas."""
    feed = feedparser.parse(url)
    items: list[dict] = []

    for e in feed.entries:
        link = e.get("link")
        if not link:
            continue

        title = (e.get("title") or "").strip()
        summary = clean_html(e.get("summary") or e.get("description") or "")

        published_raw = e.get("published") or e.get("updated")
        if published_raw:
            try:
                published_at = dateparser.parse(published_raw)
            except Exception:
                published_at = datetime.now()
        else:
            published_at = datetime.now()

        # Normaliza para UTC
        if published_at.tzinfo is None:
            published_at = published_at.replace(tzinfo=ZoneInfo("UTC"))
        else:
            published_at = published_at.astimezone(ZoneInfo("UTC"))

        # Extrai imagem (quando disponível)
        image_url = None
        content = e.get("content", [])
        if content:
            soup = BeautifulSoup(content[0].get("value", ""), "html.parser")
            img = soup.find("img")
            if img and img.get("src"):
                image_url = img["src"]

        items.append({
            "id": url_hash(link),
            "source": name,
            "title": title,
            "url": link,
            "summary": summary,
            "published_at": published_at,
            "image_url": image_url,
        })

    return items


def get_today_bounds_sao_paulo() -> tuple[datetime, datetime]:
    """Retorna limites de início e fim do dia (fuso São Paulo), convertidos para UTC."""
    now_sp = datetime.now(TZ)
    start = now_sp.replace(hour=0, minute=0, second=0, microsecond=0)
    end = start + timedelta(days=1)
    return (start.astimezone(ZoneInfo("UTC")), end.astimezone(ZoneInfo("UTC")))

# ===================== Execução principal =====================

def main():
    assert DATABASE_URL, "DATABASE_URL não definida"

    all_items: list[dict] = []
    for s in SOURCES:
        all_items.extend(parse_feed(s["name"], s["url"]))

    # Foco estrito em Bitcoin/BTC
    KEYWORDS = ("bitcoin", "btc")
    all_items = [
        it for it in all_items
        if any(k in (it["title"] + " " + (it["summary"] or "")).lower() for k in KEYWORDS)
    ]

    # Ordena por data
    all_items.sort(key=lambda x: x["published_at"], reverse=True)

    with psycopg.connect(DATABASE_URL) as conn:
        # Cria tabela se não existir
        conn.execute("""
        CREATE TABLE IF NOT EXISTS articles (
          id TEXT PRIMARY KEY,
          source TEXT NOT NULL,
          title TEXT NOT NULL,
          url TEXT NOT NULL,
          summary TEXT,
          published_at TIMESTAMPTZ NOT NULL,
          image_url TEXT,
          created_at TIMESTAMPTZ NOT NULL DEFAULT now()
        );
        CREATE INDEX IF NOT EXISTS idx_articles_published_at ON articles (published_at DESC);
        """)

        start_utc, end_utc = get_today_bounds_sao_paulo()
        cur = conn.execute(
            """
            SELECT COUNT(*) FROM articles
            WHERE published_at >= %s AND published_at < %s
            """,
            (start_utc, end_utc)
        )
        already_today = cur.fetchone()[0]
        remaining = max(0, MAX_DAILY - already_today)
        if remaining == 0:
            print(f"Nada a inserir: limite diário ({MAX_DAILY}) já atingido.")
            return

        ids = tuple(set([it["id"] for it in all_items]))
        existing = set()
        if ids:
            for i in range(0, len(ids), 500):
                batch = ids[i:i+500]
                placeholders = ",".join(["%s"] * len(batch))
                cur = conn.execute(f"SELECT id FROM articles WHERE id IN ({placeholders})", batch)
                existing.update([row[0] for row in cur.fetchall()])

        candidates = [
            it for it in all_items
            if (it["id"] not in existing) and (start_utc <= it["published_at"] < end_utc)
        ]
        to_insert = candidates[:remaining]

        if not to_insert:
            print("Sem itens novos dentro do período de hoje.")
            return

        with conn.cursor() as cur:
            cur.executemany(
                """
                INSERT INTO articles (id, source, title, url, summary, published_at, image_url)
                VALUES (%(id)s, %(source)s, %(title)s, %(url)s, %(summary)s, %(published_at)s, %(image_url)s)
                ON CONFLICT (id) DO NOTHING
                """,
                to_insert
            )

        print(f"Inseridos {len(to_insert)} novos artigos hoje (limite diário {MAX_DAILY}).")


if __name__ == "__main__":
    main()
