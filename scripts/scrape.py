# scripts/scrape.py
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
    {"name": "Livecoins", "url": "https://livecoins.com.br/feed/"},
    {"name": "Cointelegraph Brasil", "url": "https://br.cointelegraph.com/rss"},
    {"name": "Portal do Bitcoin", "url": "https://portaldobitcoin.uol.com.br/feed/"},
    {"name": "Bitcoinist", "url": "https://bitcoinist.com/feed/"}, #add 30-10-25
]


RAW_DB_URL = os.environ.get("DATABASE_URL", "").strip()
if not RAW_DB_URL:
    raise SystemExit("DATABASE_URL não definida (configure em Settings → Secrets → Actions).")


DATABASE_URL = (
    RAW_DB_URL if "sslmode=" in RAW_DB_URL
    else (RAW_DB_URL + ("&sslmode=require" if "?" in RAW_DB_URL else "?sslmode=require"))
)

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

        items.append({
            "id": url_hash(link),
            "source": name,
            "title": title,
            "url": link,
            "summary": summary,
            "published_at": published_at,
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

    # Conecta no banco (owner)
    with psycopg.connect(DATABASE_URL) as conn:
        # Cria tabela e índice se não existirem
        conn.execute("""
        CREATE TABLE IF NOT EXISTS articles (
          id TEXT PRIMARY KEY,
          source TEXT NOT NULL,
          title TEXT NOT NULL,
          url TEXT NOT NULL,
          summary TEXT,
          published_at TIMESTAMPTZ NOT NULL,
          created_at TIMESTAMPTZ NOT NULL DEFAULT now()
        );
        CREATE INDEX IF NOT EXISTS idx_articles_published_at ON articles (published_at DESC);
        """)

        # Limite diário (baseado no dia de São Paulo)
        start_utc, end_utc = get_today_bounds_sao_paulo()
        cur = conn.execute(
            "SELECT COUNT(*) FROM articles WHERE published_at >= %s AND published_at < %s",
            (start_utc, end_utc)
        )
        already_today = cur.fetchone()[0]
        remaining = max(0, MAX_DAILY - already_today)
        if remaining == 0:
            print(f"Nada a inserir: limite diário ({MAX_DAILY}) já atingido.")
            return

        # Evita duplicatas por id (hash da URL)
        ids = tuple(set([it["id"] for it in all_items]))
        existing = set()
        if ids:
            for i in range(0, len(ids), 500):
                batch = ids[i:i+500]
                placeholders = ",".join(["%s"] * len(batch))
                cur = conn.execute(f"SELECT id FROM articles WHERE id IN ({placeholders})", batch)
                existing.update([row[0] for row in cur.fetchall()])

        # Mantém apenas novos e dentro do dia corrente (TZ SP)
        candidates = [
            it for it in all_items
            if (it["id"] not in existing) and (start_utc <= it["published_at"] < end_utc)
        ]
        to_insert = candidates[:remaining]

        if not to_insert:
            print("Sem itens novos dentro do período de hoje.")
            return

        # Inserção em lote
        with conn.cursor() as cur:
            cur.executemany(
                """
                INSERT INTO articles (id, source, title, url, summary, published_at)
                VALUES (%(id)s, %(source)s, %(title)s, %(url)s, %(summary)s, %(published_at)s)
                ON CONFLICT (id) DO NOTHING
                """,
                to_insert
            )

        print(f"Inseridos {len(to_insert)} novos artigos hoje (limite diário {MAX_DAILY}).")

if __name__ == "__main__":
    main()




