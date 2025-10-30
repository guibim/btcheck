-- ==========================
-- SCHEMA: btcheck (Neon)
-- ==========================

CREATE TABLE IF NOT EXISTS articles (
    id TEXT PRIMARY KEY,
    source TEXT NOT NULL,
    title TEXT NOT NULL,
    url TEXT NOT NULL,
    summary TEXT,
    published_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_articles_published_at
    ON articles (published_at DESC);

-- Usuário de leitura (usado pelo workflow Build JSON)
-- Execute apenas uma vez com o usuário principal (owner):
-- (troque a senha abaixo por sua senha real do reader)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT FROM pg_catalog.pg_roles WHERE rolname = 'btcheck_reader'
    ) THEN
        CREATE ROLE btcheck_reader LOGIN PASSWORD 'Btcheck#2025!-@_gui';
    END IF;
END
$$;

-- Garantir permissões adequadas ao reader
GRANT CONNECT ON DATABASE neondb TO btcheck_reader;
GRANT USAGE ON SCHEMA public TO btcheck_reader;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO btcheck_reader;
ALTER DEFAULT PRIVILEGES IN SCHEMA public
    GRANT SELECT ON TABLES TO btcheck_reader;

