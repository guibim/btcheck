# contexto.md — btcheck (documentação interna)

> Arquivo interno, nunca sobe para o repositório (`.gitignore`).
> Atualizado em: março 2026

---

## Visão Geral

O **btcheck** é um projeto pessoal open-source de Guilherme Bim que centraliza informações sobre Bitcoin: notícias diárias, cotação em tempo real, Fear & Greed Index, conversor FIAT ⇄ BTC, newsletter semanal e extensão para Chrome.

- **Site:** https://guibim.github.io/btcheck
- **Repo:** https://github.com/guibim/btcheck
- **API:** hospedada no Render (free tier)
- **Banco:** NeonDB (PostgreSQL serverless)

---

## Estrutura do Monorepo

```
btcheck/                       ← raiz do repositório
├── frontend/                  ← React app (GitHub Pages)
│   ├── src/
│   │   ├── components/        ← Header, NewsSection, PriceSection, etc.
│   │   ├── contexts/          ← AppContext (idioma + tema)
│   │   ├── pages/             ← Index, Newsletter, Unsubscribe, Paper, FearAndGreed
│   │   ├── services/          ← fearGreedService, binanceService
│   │   └── lib/               ← constants.ts, utils.ts
│   ├── public/                ← bitcoin.pdf, bitcoin_pt_br.pdf, icons, robots.txt
│   └── vite.config.ts
├── scripts/
│   ├── scrape.py              ← coleta RSS → NeonDB
│   ├── build_json.py          ← gera news.json (PT+EN) → GitHub Pages
│   ├── get_btc_price.py       ← cotação BTC → btc_price.json
│   ├── api.py                 ← FastAPI: /subscribe /unsubscribe
│   ├── send_newsletter.py     ← envia newsletter via Resend
│   └── api_by_date.py         ← desativado (histórico Binance)
├── sql/                       ← schema local (git-ignored)
├── extension/                 ← Extensão Chrome MV3
│   ├── manifest.json
│   ├── popup.html / popup.css / popup.js
│   ├── background.js
│   └── icons/
├── .github/workflows/
│   ├── scrape.yml
│   ├── build_news.yml
│   ├── build_price.yml
│   ├── deploy.yml
│   └── newsletter.yml
├── render.yaml                ← config Render (FastAPI)
├── requirements.txt
└── README.md
```

---

## Versão 1.0 — Lançamento Inicial

**Período:** out/nov 2025

### O que foi feito

| Componente | Descrição |
|---|---|
| `scrape.py` | Coleta notícias de fontes RSS PT-BR e salva no NeonDB |
| `get_btc_price.py` | Obtém cotação BTC/USD e BTC/BRL via CoinGecko |
| `build_json.py` | Gera `news.json` com as últimas notícias para o frontend |
| Frontend | React + Vite + TailwindCSS + ShadCN/UI hospedado no GitHub Pages |
| Cotação | Seção com BTC/USD, BTC/BRL e botão de atualização |
| Fear & Greed | Índice via API Alternative.me |
| Conversor | FIAT ⇄ BTC (BRL, USD) |
| Apoio | Seção de doação via Lightning Network |
| GitHub Actions | `scrape.yml`, `build_news.yml`, `build_price.yml` |
| Banco | PostgreSQL no NeonDB — tabela `articles` |

### Fontes RSS (v1.0 — PT-BR)
Exame Cripto, Livecoins, CoinTelegraph BR, Portal do Bitcoin, Mercado Bitcoin, Cointimes, Crypto ID

---

## Versão 1.5 — Monorepo + Newsletter + Extensão

**Período:** jan/mar 2026

### Monorepo

- Repositório `btcheck-site` (frontend) unificado com `btcheck` (scripts) em um único repo
- Pasta `frontend/` criada na raiz; `vite.config.ts` base alterada para `/btcheck/`
- URLs de meta tags (og:image, og:url, canonical) atualizadas de `btcheck-site` → `btcheck`
- `constants.ts`: `NEWS_URL`, `PRICE_URL` e `API_URL` (via `VITE_API_URL`)
- Removido `lovable-tagger` do projeto (dependência, CSS e vite.config)

### Separação PT-BR / EN

- Coluna `lang TEXT NOT NULL DEFAULT 'pt-BR'` adicionada à tabela `articles` com índice
- `scrape.py` reescrito: cada fonte tem campo `"lang"`, 14 fontes no total
  - EN: Bitcoinist, Bitcoin Magazine, Decrypt, NewsBTC, CoinDesk
  - PT-BR: BeInCrypto Brasil, CriptoFácil + fontes originais
- `build_json.py` reescrito: gera `{ generated_at, pt: { items }, en: { items } }`
- `NewsSection.tsx` reescrito: filtra `payload.pt` ou `payload.en` pelo idioma ativo

### Sistema de idiomas no frontend

- `AppContext.tsx`: toggle PT-BR / EN com persistência em `localStorage`
- Todas as strings extraídas para o contexto de tradução (newsletter, unsubscribe, paper, etc.)
- `Header.tsx`: dropdown Globe para troca de idioma + toggle tema claro/escuro

### Newsletter

- Tabela `subscribers` criada no NeonDB: `id UUID`, `email UNIQUE`, `lang`, `confirmed`, `token`, `created_at`
- `scripts/api.py`: FastAPI com `/health`, `POST /subscribe`, `POST /unsubscribe`
  - CORS: `https://guibim.github.io` + `http://localhost:8080`
  - Token de cancelamento gerado com `secrets.token_hex(32)`
- `render.yaml`: deploy da API no Render free tier
- `scripts/send_newsletter.py`: top 10 artigos da semana por idioma, HTML com branding btcheck, enviado via Resend
- `newsletter.yml`: cron toda sexta 15:00 UTC (12:00 BRT)
- `Newsletter.tsx`: formulário com seletor de idioma, estados idle/loading/success/error
- `Unsubscribe.tsx`: cancelamento via `?token=xxx` na URL ou formulário manual com e-mail

### Bitcoin Whitepaper

- `frontend/public/bitcoin.pdf` (EN) e `bitcoin_pt_br.pdf` (PT-BR)
- `pages/Paper.tsx`: iframe fullscreen — PDF muda conforme idioma ativo
- Rota `/paper` + botão "Bitcoin Paper" no `Header.tsx`

### Extensão Chrome (MV3)

- `manifest.json`: permissões `storage` e `alarms`, service worker, popup
- `popup.html` + `popup.css`: layout 360px dark theme com cotação, conversor e footer
- `popup.js`: fetch `btc_price.json` e Fear & Greed, conversor 3 modos, toggle PT-BR/EN, cache via `chrome.storage`
- `background.js`: service worker com `chrome.alarms` — atualiza a cada 10 min
- `icons/`: SVG gerados com Node.js (₿ laranja #f7931a em fundo #0f172a)
- Instalação via "Carregar sem compactação" no Chrome (sem Web Store)

### GitHub Actions atualizados

| Workflow | Trigger | O que faz |
|---|---|---|
| `scrape.yml` | Cron diário | Executa `scrape.py` |
| `build_news.yml` | Cron + manual | Build frontend + `news.json` → deploy |
| `build_price.yml` | Cron + manual | Build frontend + `btc_price.json` → deploy |
| `deploy.yml` | Push em `frontend/**` | Deploy frontend puro |
| `newsletter.yml` | Sexta 15:00 UTC | Envia digest semanal |

Todos os builds passam `VITE_API_URL: ${{ vars.VITE_API_URL }}` (GitHub Variable).

---

## Variáveis de ambiente

| Variável | Onde configurar | Uso |
|---|---|---|
| `DATABASE_URL` | Render → Environment | Escrita no NeonDB (`api.py`) |
| `DATABASE_URL_READONLY` | GitHub Secrets | Leitura no NeonDB (`send_newsletter.py`) |
| `RESEND_API_KEY` | GitHub Secrets | Envio de e-mail (`send_newsletter.py`) |
| `VITE_API_URL` | GitHub Variables | URL da API Render no build do frontend |

---

## Decisões técnicas importantes

- **Sem Supabase:** projeto usa exclusivamente NeonDB. Supabase foi removido de todas as referências.
- **FastAPI no Render free tier:** permite escrita no banco sem expor credenciais no frontend estático.
- **SVG icons na extensão:** Chrome MV3 aceita SVG. Para publicar na Web Store, gerar PNG com `node generate_icons.js` (requer `npm install canvas`).
- **PDFs no `frontend/public/`:** incluídos automaticamente no build output do GitHub Pages pelo Vite.
- **`btcheck-main` subfolder (erro resolvido):** durante a migração, arquivos foram colocados em subpasta por engano. Correção: mover tudo para a raiz e recomitar.
