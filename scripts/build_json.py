# scripts/build_json.py
# Gera public/news.json a partir do Neon (read-only)

import os
import json
from datetime import datetime, timezone
from pathlib import Path
import psycopg
from psycopg.rows import dict_row
from urllib.parse import urlsplit, urlunsplit, parse_qsl, urlencode

# ===== Config =====
LIMIT = int(os.environ.get("NEWS_LIMIT", "10"))

# Lê a URL do banco (usuário read-only) do secret e normaliza
RAW = (os.environ.get("DATABASE_URL_READONLY") or "").strip()
if not RAW:
    raise SystemExit("DATABASE_URL_READONLY não definida (adicione em Settings → Secrets → Actions).")

# Normaliza querystring: remove channel_binding e força sslmode=require
parts = urlsplit(RAW)
qs = dict(parse_qsl(parts.query, keep_blank_values=True))
qs.pop("channel_binding", None)
qs["sslmode"] = "require"
DATABASE_URL = urlunsplit((parts.scheme, parts.netloc, parts.path, urlencode(qs), parts.fragment))

# Consulta: últimos N artigos ordenados por published_at (TZ São Paulo para exibição)
QUERY = """
    SELECT
        id,
        source,
        title,
        url,
        summary,
        to_char(
            published_at AT TIME ZONE 'America/Sao_Paulo',
            'YYYY-MM-DD"T"HH24:MI:SSOF'
        ) AS published_at
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
    out_path.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"news.json gerado em {out_path} com {len(rows)} itens.")

if __name__ == "__main__":
    main()

