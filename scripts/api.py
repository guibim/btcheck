"""
BTCheck — API pública (subscribe / unsubscribe)
Deploy: Render free tier  →  uvicorn scripts.api:app --host 0.0.0.0 --port $PORT

Variáveis de ambiente necessárias:
  DATABASE_URL          — conexão principal Neon (escrita)
  CORS_ALLOW_ORIGINS    — origens permitidas (padrão: https://guibim.github.io)
"""

from __future__ import annotations

import os
import secrets
from urllib.parse import urlsplit, urlunsplit, parse_qsl, urlencode

import psycopg
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr


# ── Config ────────────────────────────────────────────────────────────────────
RAW_DB_URL = (os.environ.get("DATABASE_URL") or "").strip()
if not RAW_DB_URL:
    raise SystemExit("DATABASE_URL não definida.")

parts = urlsplit(RAW_DB_URL)
qs = dict(parse_qsl(parts.query, keep_blank_values=True))
qs.pop("channel_binding", None)
qs["sslmode"] = "require"
DATABASE_URL = urlunsplit((parts.scheme, parts.netloc, parts.path, urlencode(qs), parts.fragment))

CORS_ORIGINS = [
    o.strip()
    for o in (os.environ.get("CORS_ALLOW_ORIGINS") or "").split(",")
    if o.strip()
] or ["https://guibim.github.io", "http://localhost:8080"]


# ── App ───────────────────────────────────────────────────────────────────────
app = FastAPI(title="BTCheck API", version="1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=False,
    allow_methods=["GET", "POST"],
    allow_headers=["Content-Type"],
)


# ── Schemas ───────────────────────────────────────────────────────────────────
class SubscribeRequest(BaseModel):
    email: EmailStr
    lang: str = "pt-BR"


class UnsubscribeRequest(BaseModel):
    token: str | None = None
    email: EmailStr | None = None


# ── Endpoints ─────────────────────────────────────────────────────────────────
@app.get("/health")
def health():
    return {"status": "ok"}


@app.post("/subscribe", status_code=201)
def subscribe(body: SubscribeRequest):
    if body.lang not in ("pt-BR", "en"):
        raise HTTPException(status_code=422, detail="lang must be 'pt-BR' or 'en'.")

    token = secrets.token_hex(32)
    email = body.email.lower().strip()

    try:
        with psycopg.connect(DATABASE_URL) as conn:
            conn.execute(
                """
                INSERT INTO subscribers (email, lang, token)
                VALUES (%s, %s, %s)
                ON CONFLICT (email) DO UPDATE
                    SET lang = EXCLUDED.lang, confirmed = true
                """,
                (email, body.lang, token),
            )
    except psycopg.Error:
        raise HTTPException(status_code=500, detail="Database error.")

    return {"status": "subscribed"}


@app.post("/unsubscribe")
def unsubscribe(body: UnsubscribeRequest):
    if not body.token and not body.email:
        raise HTTPException(status_code=422, detail="Provide 'token' or 'email'.")

    try:
        with psycopg.connect(DATABASE_URL) as conn:
            if body.token:
                result = conn.execute(
                    "UPDATE subscribers SET confirmed = false WHERE token = %s",
                    (body.token,),
                )
            else:
                result = conn.execute(
                    "UPDATE subscribers SET confirmed = false WHERE email = %s",
                    (body.email.lower().strip(),),  # type: ignore[union-attr]
                )

            if result.rowcount == 0:
                raise HTTPException(status_code=404, detail="Subscriber not found.")

    except HTTPException:
        raise
    except psycopg.Error:
        raise HTTPException(status_code=500, detail="Database error.")

    return {"status": "unsubscribed"}
