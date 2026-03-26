-- ==========================
-- SCHEMA: btcheck (Neon)
-- ==========================

CREATE TABLE IF NOT EXISTS articles (
    id             TEXT PRIMARY KEY,
    source         TEXT NOT NULL,
    title          TEXT NOT NULL,
    url            TEXT NOT NULL,
    summary        TEXT,
    published_at   TIMESTAMPTZ NOT NULL,
    relevance_score REAL NOT NULL DEFAULT 0,
    created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
    lang           TEXT NOT NULL DEFAULT 'pt-BR'
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_articles_published_at
    ON articles (published_at DESC);

CREATE INDEX IF NOT EXISTS idx_articles_lang
    ON articles (lang);

-- Backfill: classifica artigos existentes das fontes EN
-- (seguro executar múltiplas vezes — WHERE lang DEFAULT garante idempotência)
UPDATE articles
SET lang = 'en'
WHERE source IN (
    'CoinDesk',
    'Cointelegraph (EN)',
    'CryptoSlate',
    'CryptoPotato',
    'The Defiant',
    'Bitcoinist',
    'Bitcoin Magazine',
    'Decrypt',
    'NewsBTC'
)
AND lang = 'pt-BR';

-- Usuário de leitura (usado pelo workflow Build JSON)
-- Execute apenas uma vez com o usuário principal (owner):
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT FROM pg_catalog.pg_roles WHERE rolname = 'btcheck_reader'
    ) THEN
        CREATE ROLE btcheck_reader LOGIN PASSWORD 'Btcheck#2025!-@_gui';
    END IF;
END
$$;

GRANT CONNECT ON DATABASE neondb TO btcheck_reader;
GRANT USAGE ON SCHEMA public TO btcheck_reader;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO btcheck_reader;
ALTER DEFAULT PRIVILEGES IN SCHEMA public
    GRANT SELECT ON TABLES TO btcheck_reader;

-- ── Subscribers (gerenciada pela API — ver subscribers.sql) ──────────────────
-- O GRANT abaixo cobre a tabela subscribers quando criada pelo owner.
-- Se criada separadamente, execute: GRANT SELECT ON TABLE subscribers TO btcheck_reader;
