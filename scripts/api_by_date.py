"""
BTCheck - api_by_date.py (DISABLED BY DEFAULT)

Status:
- NOT USED IN PRODUCTION.
- This module is intentionally disabled to avoid exposing a public historical-search endpoint
  without proper authentication/rate limiting.

"""

from __future__ import annotations

import os
from datetime import date, datetime, timezone
from typing import List, Optional
from urllib.parse import urlsplit, urlunsplit, parse_qsl, urlencode

import psycopg
from fastapi import FastAPI, HTTPException, Query, Request
from fastapi.middleware.cors import CORSMiddleware
from psycopg.rows import dict_row
from pydantic import BaseModel


# -----------------------------
# Feature flag (disabled by default)
# -----------------------------
API_ENABLED = os.environ.get("API_ENABLED", "0").strip() == "1"
if not API_ENABLED:
    raise SystemExit(
        "api_by_date.py is disabled by default. "
        "Set API_ENABLED=1 to enable."
    )


# -----------------------------
# Configuration
# -----------------------------
RAW_DB_URL = (os.environ.get("DATABASE_URL_READONLY") or "").strip()
if not RAW_DB_URL:
    raise SystemExit("DATABASE_URL_READONLY is not defined.")

parts = urlsplit(RAW_DB_URL)
qs = dict(parse_qsl(parts.query, keep_blank_values=True))
qs.pop("channel_binding", None)
qs["sslmode"] = "require"
DATABASE_URL_READONLY = urlunsplit(
    (parts.scheme, parts.netloc, parts.path, urlencode(qs), parts.fragment)
)

API_KEY = (os.environ.get("API_KEY") or "").strip()

# Restrictive by default; set explicitly in env when enabling
CORS_ALLOW_ORIGINS = [
    o.strip()
    for o in (os.environ.get("CORS_ALLOW_ORIGINS") or "").split(",")
    if o.strip()
] or ["https://guibim.github.io"]


# -----------------------------
# Schemas
# -----------------------------
class Noticia(BaseModel):
    id: str
    source: str
    title: str
    url: str
    summary: Optional[str] = None
    image_url: Optional[str] = None
    published_at: str


class NoticiaResponse(BaseModel):
    generated_at: datetime
    count: int
    items: List[Noticia]


# -----------------------------
# App
# -----------------------------
app = FastAPI(title="BTCheck API (Historical Search)")

app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ALLOW_ORIGINS,
    allow_credentials=False,
    allow_methods=["GET"],
    allow_headers=["*"],
)


def require_api_key(request: Request) -> None:
    """
    Simple API key guard. If API_KEY isn't set, the endpoint is blocked by default.
    """
    if not API_KEY:
        raise HTTPException(
            status_code=403,
            detail="API is not configured (API_KEY missing).",
        )
    provided = request.headers.get("x-api-key") or request.headers.get("X-API-Key")
    if not provided or provided != API_KEY:
        raise HTTPException(status_code=401, detail="Unauthorized.")


@app.get(
    "/api/by-date",
    response_model=NoticiaResponse,
    summary="Fetch articles by specific date (America/Sao_Paulo)",
)
async def get_noticias_por_data(
    request: Request,
    data: date = Query(..., description="YYYY-MM-DD"),
    limit: int = Query(20, ge=1, le=200, description="Max items (1-200)"),
):
    require_api_key(request)

    sql = """
        SELECT
            id, source, title, url, summary, image_url,
            to_char(
                published_at AT TIME ZONE 'America/Sao_Paulo',
                'YYYY-MM-DD"T"HH24:MI:SSOF'
            ) AS published_at
        FROM articles
        WHERE (published_at AT TIME ZONE 'America/Sao_Paulo')::date = %s
        ORDER BY published_at DESC
        LIMIT %s
    """

    try:
        with psycopg.connect(DATABASE_URL_READONLY, row_factory=dict_row) as conn:
            rows = conn.execute(sql, (data, limit)).fetchall()

        return {
            "generated_at": datetime.now(timezone.utc),
            "count": len(rows),
            "items": rows,
        }
    except psycopg.Error:
        # Don't leak DB details
        raise HTTPException(status_code=500, detail="Database query failed.")
    except Exception:
        raise HTTPException(status_code=500, detail="Unexpected server error.")
