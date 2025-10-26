# scripts/build_json.py
# Gera public/news.json com as últimas N notícias do Neon (read-only)
import os, json
from datetime import datetime, timezone
from pathlib import Path
import psycopg
from psycopg.rows import dict_row

LIMIT = int(os.environ.get("NEWS_LIMIT", "10"))
DATABASE_URL = os.environ["DATABASE_URL_READONLY"]  # use read-only user se possível

QUERY = """
    SELECT id, source, title, url, summary, image_url,
           to_char(published_at AT TIME ZONE 'America/Sao_Paulo',
                   'YYYY-MM-DD"T"HH24:MI:SSOF') AS published_at
    FROM articles
    ORDER BY published_at DESC
    LIMIT %s
"""

def main():
    Path("public").mkdir(exist_ok=True)
    with psycopg.connect(DATABASE_URL, row_factory=dict_row) as conn:
        rows = conn.execute(QUERY, (LIMIT,)).fetchall()

    payload = {
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "count": len(rows),
        "items": rows
    }
    out_path = Path("public/news.json")
    with out_path.open("w", encoding="utf-8") as f:
        json.dump(payload, f, ensure_ascii=False, indent=2)
    print(f"news.json gerado em {out_path} com {len(rows)} itens.")

if __name__ == "__main__":
    main()
