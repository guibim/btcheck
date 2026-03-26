# Contexto do Projeto BTCheck

## Visão Geral

**BTCheck** é um projeto open-source que coleta automaticamente notícias sobre Bitcoin em português e a cotação BTC/USD, armazenando em PostgreSQL (Neon) e publicando JSONs atualizados via GitHub Actions. O resultado é exibido em um frontend React hospedado no GitHub Pages.

**Desenvolvedor:** Guilherme Bim
**Status atual:** v1.0 — Produção
**Missão imediata:** Unificar dois repositórios separados em um monorepo, com endpoint final em `guibim.github.io/btcheck`

---

## Histórico dos Repositórios

O projeto nasceu dividido em dois repositórios distintos:

| Repo | URL | Origem | Conteúdo |
|------|-----|--------|----------|
| `btcheck` | github.com/guibim/btcheck | Feito manualmente, sem IA | Scripts Python, SQL, GitHub Actions |
| `btcheck-site` | github.com/guibim/btcheck-site | Gerado com Lovable | Frontend React + TypeScript |

Localmente, `btcheck-site` foi renomeado para `frontend/` como primeiro passo da unificação.

**Objetivo:** transformar tudo em um único monorepo com a estrutura abaixo, onde o GitHub Pages sirva a partir de `/btcheck`, resultando na URL `guibim.github.io/btcheck`.

---

## Estrutura Alvo do Monorepo

```
btcheck/                          ← raiz do repositório
├── .github/
│   └── workflows/
│       ├── scrape.yml            ← coleta notícias (diário 12h BRL)
│       ├── build_news.yml        ← gera news.json + deploy (9h10 e 19h10 BRL)
│       └── build_price.yml       ← atualiza preço (a cada 10 min)
├── scripts/
│   ├── scrape.py                 ← raspagem RSS + scoring de relevância
│   ├── build_json.py             ← gera news.json do banco
│   ├── get_btc_price.py          ← busca preço BTC na CoinGecko
│   └── api_by_date.py            ← FastAPI histórico (desabilitado em prod)
├── sql/
│   └── schema.sql                ← schema PostgreSQL (Neon)
├── frontend/                     ← SPA React (antes btcheck-site)
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── vite.config.ts
├── requirements.txt
├── contexto.md                   ← este arquivo
└── README.md
```

---

## Backend — Scripts Python (feitos manualmente)

### `scripts/scrape.py`

Motor de raspagem e agregação de notícias.

**O que faz:**
- Consome 9 feeds RSS em PT-BR e EN:
  - Português: Livecoins, Cointelegraph Brasil, Portal do Bitcoin, Bitcoinist
  - Inglês: CoinDesk, Cointelegraph EN, CryptoSlate, CryptoPotato, The Defiant
- Calcula **score de relevância** por artigo combinando:
  - Peso por palavra-chave (`bitcoin`: 3.0, `btc`: 2.5, `blockchain`: 1.5...)
  - Peso por reputação da fonte (0.6 a 1.0)
  - Score de recência (decaimento exponencial em 36h)
- Limita a **20 artigos/dia** (timezone São Paulo)
- Deduplica por hash SHA256 da URL
- Persiste no PostgreSQL via `psycopg`

**Dependências:** `feedparser`, `beautifulsoup4`, `psycopg`, `python-dateutil`

---

### `scripts/build_json.py`

Gera o arquivo `news.json` consumido pelo frontend.

**O que faz:**
- Lê do banco com credenciais somente-leitura
- Busca os 10 artigos mais recentes/relevantes
- Serializa para JSON com metadados (`generated_at`, `count`, `items[]`)
- Converte timestamps para America/Sao_Paulo (sem UTC exposto)
- Normaliza a connection string (remove `channel_binding`, força `sslmode=require`)
- Cria diretório `public/` se não existir

**Variáveis de ambiente:** `DATABASE_URL_READONLY`, `NEWS_LIMIT` (padrão: 10)

---

### `scripts/get_btc_price.py`

Busca e publica a cotação BTC em tempo real.

**O que faz:**
- Consulta CoinGecko `/api/v3/simple/price` para BTC em USD e BRL
- Publica `btc_price.json` com schema:
  ```json
  { "updated_at": "...", "source": "coingecko", "prices": { "BTC_USD": 0, "BTC_BRL": 0 } }
  ```
- Executa a cada 10 minutos via GitHub Actions (~144 chamadas/dia)

---

### `scripts/api_by_date.py`

Endpoint FastAPI para consulta histórica por data. **Desabilitado por padrão em produção.**

**O que faz:**
- `GET /api/by-date?data=YYYY-MM-DD&limit=1-200`
- Autenticação via header `x-api-key`
- CORS restrito a `https://guibim.github.io`
- Ativado somente com `API_ENABLED=1`

---

## Banco de Dados

### `sql/schema.sql` — PostgreSQL (Neon)

```sql
CREATE TABLE articles (
  id             TEXT PRIMARY KEY,        -- SHA256 do URL
  source         TEXT NOT NULL,           -- nome da fonte
  title          TEXT NOT NULL,           -- título do artigo
  url            TEXT NOT NULL,           -- link
  summary        TEXT,                    -- HTML → texto limpo
  published_at   TIMESTAMPTZ NOT NULL,    -- data de publicação (UTC)
  relevance_score REAL NOT NULL DEFAULT 0,-- score calculado
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_articles_published_at ON articles (published_at DESC);
```

**Usuários:**
- Usuário principal: acesso total (escrita pelo scrape)
- `btcheck_reader`: somente-leitura (usado pelo `build_json.py`)

---

## GitHub Actions Workflows

### `.github/workflows/scrape.yml`
- **Trigger:** Diário às 15:00 UTC (12:00 BRL) + dispatch manual
- **Ambiente:** Ubuntu-latest, Python 3.11
- **Secret:** `DATABASE_URL` (acesso de escrita)
- **Ação:** Executa `scrape.py`

### `.github/workflows/build_news.yml`
- **Trigger:** 12:10 e 22:10 UTC (9:10 e 19:10 BRL) + dispatch manual
- **Concorrência:** Cancela build anterior em andamento
- **Ações:**
  1. Gera `news.json` do banco
  2. Faz fallback para `btc_price.json` existente
  3. Deploy para GitHub Pages
- **Secret:** `DATABASE_URL_READONLY`

### `.github/workflows/build_price.yml`
- **Trigger:** `*/10 * * * *` (a cada 10 min) + dispatch manual
- **Ações:**
  1. Faz fallback para `news.json` existente
  2. Executa `get_btc_price.py`
  3. Deploy para GitHub Pages
- **Respeita:** Limite de 30 req/min da CoinGecko

---

## Frontend — React SPA (gerado com Lovable)

Stack: **Vite + React 18 + TypeScript + TailwindCSS + ShadCN/UI**

### Páginas

| Rota | Arquivo | Descrição |
|------|---------|-----------|
| `/` | `pages/Index.tsx` | Landing principal com cotação, notícias e conversor |
| `/historico` | `pages/Historico.tsx` | Gráfico e tabela de histórico de preços |
| `/fear-and-greed` | `pages/FearAndGreed.tsx` | Índice de sentimento do mercado |
| `/newsletter` | `pages/Newsletter.tsx` | Página de newsletter (placeholder — backend não implementado) |
| `*` | `pages/NotFound.tsx` | 404 |

---

### Componentes Principais

| Componente | Arquivo | Função |
|------------|---------|--------|
| Header | `components/Header.tsx` | Navbar sticky com logo, Fear & Greed badge, idioma, tema |
| PriceSection | `components/PriceSection.tsx` | Cotação BTC/USD e BTC/BRL em tempo real |
| BTCConverter | `components/BTCConverter.tsx` | Conversor BTC ↔ BRL/USD (4 modos) |
| NewsSection | `components/NewsSection.tsx` | Feed das últimas 10 notícias em grid |
| SupportSection | `components/SupportSection.tsx` | QR Lightning + link referral BIPA |
| FearGreedBadge | `components/FearGreedBadge.tsx` | Badge colorido no header com valor atual |
| Footer | `components/Footer.tsx` | Créditos, links e CTA de suporte |

---

### Serviços e Dados

| Serviço | Arquivo | API | Cache |
|---------|---------|-----|-------|
| Cotação BTC | `PriceSection.tsx` direto | `github.io/btcheck/btc_price.json` | Cache-bust por `?t=timestamp` |
| Notícias | `NewsSection.tsx` direto | `github.io/btcheck/news.json` | — |
| Fear & Greed | `services/fearGreedService.ts` | `api.alternative.me/fng/` | localStorage, TTL 60 min |
| Histórico preços | `services/binanceService.ts` | `api.binance.com/api/v3/klines` | — |

---

### Estado Global

`contexts/AppContext.tsx` gerencia:
- **Idioma:** `pt-BR` | `en` (padrão: pt-BR) — persistido em localStorage
- **Tema:** `light` | `dark` (padrão: dark) — persistido em localStorage
- **Traduções:** 126 chaves cobrindo toda a UI

---

### Configuração Vite

```typescript
// vite.config.ts — PRECISA MUDAR no monorepo
base: '/btcheck-site/'   // → atualizar para '/btcheck/'
```

**Importante:** O `base` path precisa ser atualizado de `/btcheck-site/` para `/btcheck/` ao migrar para o monorepo.

---

### Supabase

`src/integrations/supabase/client.ts` está configurado mas **não está sendo usado em produção**. Preparado para features futuras (autenticação, newsletter).

---

## Fluxo de Dados Completo

```
Feeds RSS (9 fontes)
    ↓
scrape.py — scoring, deduplicação, save no Neon PostgreSQL
    ↓ (diário, 12h BRL)
build_json.py — lê banco, serializa JSON
    ↓
GitHub Pages: news.json
    ↓
Frontend → NewsSection.tsx → exibição

CoinGecko API
    ↓
get_btc_price.py
    ↓ (a cada 10 min)
GitHub Pages: btc_price.json
    ↓
Frontend → PriceSection.tsx + BTCConverter.tsx

alternative.me API
    ↓ (direto do browser, cache 60 min)
fearGreedService.ts → FearGreedBadge + FearAndGreed page

Binance API /klines
    ↓ (direto do browser)
binanceService.ts → Historico page
```

---

## APIs Externas

| API | Endpoint | Finalidade | Limite |
|-----|----------|-----------|--------|
| CoinGecko | `/api/v3/simple/price` | Preço BTC USD/BRL | 30 req/min |
| Binance | `/api/v3/klines` | Histórico BTCUSDT diário | 1200 req/min |
| alternative.me | `/fng/` | Fear & Greed Index | Cache 60 min |

---

## Dependências Python (`requirements.txt`)

```
feedparser==6.0.11
beautifulsoup4==4.12.3
psycopg[binary]
python-dateutil==2.9.0.post0
fastapi==0.115.0          # api_by_date.py (desabilitado)
sqlalchemy==2.0.36        # api_by_date.py (desabilitado)
apscheduler==3.10.4       # não usado em prod (actions substituem)
```

---

## Dependências Frontend (principais)

| Pacote | Versão | Uso |
|--------|--------|-----|
| react | 18.3.1 | Framework principal |
| react-router-dom | 6.30.1 | Roteamento SPA |
| @tanstack/react-query | 5.83.0 | Data fetching |
| tailwindcss | 3.4.17 | Estilos |
| recharts | 3.3.0 | Gráfico Fear & Greed |
| chart.js | 4.5.1 | Gráfico histórico de preços |
| date-fns | 3.6.0 | Formatação de datas |
| lucide-react | 0.462.0 | Ícones |
| zod | 3.25.76 | Validação de schemas |
| @supabase/supabase-js | 2.76.1 | Configurado, não usado ativamente |

---

## Segurança

- Credenciais do banco ficam nos **GitHub Secrets** (nunca no código)
- Role `btcheck_reader` com acesso somente-leitura para o `build_json.py`
- `api_by_date.py` protegido por `x-api-key` e flag `API_ENABLED`
- CORS restrito a `guibim.github.io`
- Mensagens de erro não expõem detalhes do banco

---

## O que está implementado (v1.0)

**Funcionando:**
- Coleta diária de notícias (20 artigos/dia, 9 fontes)
- Cotação BTC/USD e BTC/BRL em tempo real (a cada 10 min)
- Scoring de relevância para priorizar notícias importantes
- Conversor BTC ↔ BRL/USD (4 modos)
- Fear & Greed Index com histórico 90 dias
- Histórico de preços com gráfico (7/30/90 dias + busca por data)
- Suporte PT-BR / EN
- Tema light/dark
- Google Analytics (G-KN4ZG5H6B6)
- QR Code Lightning Network para doações

**Placeholder (não implementado):**
- Sistema de newsletter (frontend pronto, sem backend)
- Autenticação de usuários
- `api_by_date.py` desabilitado em produção

---

## Missão Atual: Monorepo v1.0 → Estrutura Unificada

### Problema
Dois repositórios separados (`btcheck` e `btcheck-site`) geram:
- Dois deploys independentes com bases diferentes
- URL final: `guibim.github.io/btcheck-site/` (não ideal)
- Dificuldade de manutenção e versionamento conjunto

### Solução
Unificar em um único monorepo `btcheck`, onde:
- Scripts Python, SQL e workflows ficam na raiz
- O frontend fica em `/frontend`
- GitHub Pages faz deploy a partir do build do frontend
- URL final: `guibim.github.io/btcheck`

### Mudanças críticas para a migração
1. Atualizar `vite.config.ts`: `base: '/btcheck-site/'` → `base: '/btcheck/'`
2. Atualizar `index.html`: canonical e OG URL para `guibim.github.io/btcheck`
3. Consolidar os GitHub Actions workflows em um único repositório
4. Os JSONs de dados (`news.json`, `btc_price.json`) já apontam para `guibim.github.io/btcheck` em `src/lib/constants.ts` — isso está correto
5. Remover dependência do Supabase se não for ser usada na v1.0

### Estado atual da pasta local
```
c:\Repo local\btcheck\          ← backend (scripts + sql + workflows)
c:\Repo local\frontend\         ← frontend React (renomeado de btcheck-site)
```

---

## Roadmap: Ideias para v2.0

> Esta seção será preenchida conforme as ideias forem debatidas.

A v2.0 parte de uma base sólida com:
- Monorepo organizado e bem documentado
- Pipeline de dados automatizado e confiável
- Frontend moderno com boa UX

As ideias para a próxima versão serão discutidas e registradas aqui.

---

## Arquivos por Categoria

### Backend
- [scripts/scrape.py](scripts/scrape.py) — Motor de coleta RSS + scoring
- [scripts/build_json.py](scripts/build_json.py) — Gerador do news.json
- [scripts/get_btc_price.py](scripts/get_btc_price.py) — Coleta de preço BTC
- [scripts/api_by_date.py](scripts/api_by_date.py) — API histórica (desabilitada)
- [sql/schema.sql](sql/schema.sql) — Schema PostgreSQL
- [requirements.txt](requirements.txt) — Dependências Python

### GitHub Actions
- [.github/workflows/scrape.yml](.github/workflows/scrape.yml)
- [.github/workflows/build_news.yml](.github/workflows/build_news.yml)
- [.github/workflows/build_price.yml](.github/workflows/build_price.yml)

### Frontend — Configuração
- [frontend/package.json](frontend/package.json)
- [frontend/vite.config.ts](frontend/vite.config.ts) — **base path a ser atualizado**
- [frontend/tailwind.config.ts](frontend/tailwind.config.ts)
- [frontend/index.html](frontend/index.html) — **canonical a ser atualizado**

### Frontend — Aplicação
- [frontend/src/main.tsx](frontend/src/main.tsx)
- [frontend/src/App.tsx](frontend/src/App.tsx)
- [frontend/src/contexts/AppContext.tsx](frontend/src/contexts/AppContext.tsx)
- [frontend/src/lib/constants.ts](frontend/src/lib/constants.ts) — URLs das APIs

### Frontend — Páginas
- [frontend/src/pages/Index.tsx](frontend/src/pages/Index.tsx)
- [frontend/src/pages/Historico.tsx](frontend/src/pages/Historico.tsx)
- [frontend/src/pages/FearAndGreed.tsx](frontend/src/pages/FearAndGreed.tsx)
- [frontend/src/pages/Newsletter.tsx](frontend/src/pages/Newsletter.tsx)

### Frontend — Componentes
- [frontend/src/components/Header.tsx](frontend/src/components/Header.tsx)
- [frontend/src/components/PriceSection.tsx](frontend/src/components/PriceSection.tsx)
- [frontend/src/components/BTCConverter.tsx](frontend/src/components/BTCConverter.tsx)
- [frontend/src/components/NewsSection.tsx](frontend/src/components/NewsSection.tsx)
- [frontend/src/components/FearGreedBadge.tsx](frontend/src/components/FearGreedBadge.tsx)
- [frontend/src/components/SupportSection.tsx](frontend/src/components/SupportSection.tsx)
- [frontend/src/components/Footer.tsx](frontend/src/components/Footer.tsx)

### Frontend — Serviços
- [frontend/src/services/fearGreedService.ts](frontend/src/services/fearGreedService.ts)
- [frontend/src/services/binanceService.ts](frontend/src/services/binanceService.ts)
- [frontend/src/lib/utils.ts](frontend/src/lib/utils.ts)
- [frontend/src/lib/fearGreedUtils.ts](frontend/src/lib/fearGreedUtils.ts)
