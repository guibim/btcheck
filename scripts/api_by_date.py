# api_by_date.py
# (API Dinâmica para consultar datas específicas)

import os
import json
from datetime import date, datetime, timezone
from typing import List
from urllib.parse import urlsplit, urlunsplit, parse_qsl, urlencode

import psycopg
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from psycopg.rows import dict_row
from pydantic import BaseModel

# ===== Configuração (Baseada no build_json.py) =====

# Reutiliza a lógica de conexão do build_json.py
RAW = (os.environ.get("DATABASE_URL_READONLY") or "").strip()
if not RAW:
    raise SystemExit("DATABASE_URL_READONLY não definida.")

# Normaliza a URL do banco (lógica do build_json.py)
parts = urlsplit(RAW)
qs = dict(parse_qsl(parts.query, keep_blank_values=True))
qs.pop("channel_binding", None)
qs["sslmode"] = "require"
DATABASE_URL_READONLY = urlunsplit((parts.scheme, parts.netloc, parts.path, urlencode(qs), parts.fragment))

# ===== Schemas Pydantic (Formato do JSON de resposta) =====

class Noticia(BaseModel):
    id: str
    source: str
    title: str
    url: str
    summary: str | None = None
    image_url: str | None = None
    published_at: str 

class NoticiaResponse(BaseModel):
    generated_at: datetime
    count: int
    items: List[Noticia]

# ===== Aplicação FastAPI =====

app = FastAPI(title="BTCheck API (Buscas Históricas)")

# Adiciona CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["GET"],
    allow_headers=["*"],
)

# ===== Endpoint da API =====

@app.get(
    "/api/by-date", # Endpoint específico para busca por data
    response_model=NoticiaResponse,
    summary="Busca notícias por uma data específica"
)
async def get_noticias_por_data(
    # 'data' é um parâmetro OBRIGATÓRIO (ex: .../api/by-date?data=2025-10-28)
    data: date = Query(..., description="Data no formato YYYY-MM-DD"),
    limit: int = Query(20, description="Limite de resultados")
):
    """
    Busca notícias de um dia específico, com base no fuso horário 
    de São Paulo (mesmo fuso usado no scrape.py).
    """
    
    # SQL que busca pela data específica
    # Reutiliza a formatação de data do build_json.py
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
    params = (data, limit)

    try:
        # Conecta no banco read-only
        with psycopg.connect(DATABASE_URL_READONLY, row_factory=dict_row) as conn:
            rows = conn.execute(sql, params).fetchall()
        
        return {
            "generated_at": datetime.now(timezone.utc),
            "count": len(rows),
            "items": rows
        }
    except Exception as e:
        print(f"Erro de banco de dados: {e}")
        raise HTTPException(status_code=500, detail="Erro ao consultar o banco de dados.")
