# scripts/build_json.py
# Gera public/news.json a partir do Supabase (read-only)
# Estrutura de saída: { generated_at, pt: { count, items }, en: { count, items } }

import os
import json
from datetime import datetime, timezone
from pathlib import Path
import psycopg
from psycopg.rows import dict_row
from urllib.parse import urlsplit, urlunsplit, parse_qsl, urlencode

# ===== Config =====
LIMIT = int(os.environ.get("NEWS_LIMIT", "10"))

RAW = (os.environ.get("DATABASE_URL_READONLY") or "").strip()
if not RAW:
    raise SystemExit("DATABASE_URL_READONLY não definida (adicione em Settings → Secrets → Actions).\nUse a connection string do Supabase: Settings → Database → Connection string → URI.")

parts = urlsplit(RAW)
qs = dict(parse_qsl(parts.query, keep_blank_values=True))
qs.pop("channel_binding", None)
qs["sslmode"] = "require"
DATABASE_URL = urlunsplit((parts.scheme, parts.netloc, parts.path, urlencode(qs), parts.fragment))

QUERY = """
    SELECT
        id,
        source,
        lang,
        title,
        url,
        summary,
        to_char(
            published_at AT TIME ZONE 'America/Sao_Paulo',
            'YYYY-MM-DD'
        ) AS published_date
    FROM articles
    WHERE lang = %s
    ORDER BY published_at DESC, relevance_score DESC
    LIMIT %s
"""


def main():
    Path("public").mkdir(exist_ok=True)

    with psycopg.connect(DATABASE_URL, row_factory=dict_row) as conn:
        rows_pt = conn.execute(QUERY, ("pt-BR", LIMIT)).fetchall()
        rows_en = conn.execute(QUERY, ("en",    LIMIT)).fetchall()

    payload = {
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "pt": {
            "count": len(rows_pt),
            "items": rows_pt,
        },
        "en": {
            "count": len(rows_en),
            "items": rows_en,
        },
    }

    out_path = Path("public/news.json")
    out_path.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"news.json gerado em {out_path} — PT-BR: {len(rows_pt)} | EN: {len(rows_en)}")


if __name__ == "__main__":
    main()
