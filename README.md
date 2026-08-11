# btcheck — Bitcoin News & Price

Open-source project that automatically aggregates daily Bitcoin news, displays live BTC/USD and BTC/BRL prices, and includes a fiat-to-Bitcoin converter. Available as a website and a Chrome extension.

**Website:** [guibim.github.io/btcheck](https://guibim.github.io/btcheck)

---

## Chrome Extension — Manual Installation

No Chrome Web Store required.

### 1. Download

Download the repository as a ZIP:

```
https://github.com/guibim/btcheck/archive/refs/heads/main.zip
```

Extract the file. The extension folder is at `btcheck/extension/`.

### 2. Load in Chrome

1. Open Chrome and go to `chrome://extensions/`
2. Enable **Developer mode** (top right toggle)
3. Click **"Load unpacked"**
4. Select the `extension/` folder from the extracted repository

The btcheck icon (₿) will appear in your Chrome toolbar.

### What the extension does

- Live BTC/USD and BTC/BRL price display
- Fear & Greed Index with dynamic color indicator
- Quick converter: BRL → BTC · USD → BTC · BTC → Fiat
- Automatic background refresh every 10 minutes
- PT-BR and EN language support with persistent preference

---

## Project Structure

```
btcheck/
├── frontend/           React + TypeScript + TailwindCSS (GitHub Pages)
├── scripts/            Python: scraping, JSON build, newsletter
├── supabase/functions/ Edge Functions: subscribe, unsubscribe (subscribers DB, temporary)
├── extension/          Chrome Extension (Manifest V3)
└── .github/workflows/  GitHub Actions: scrape, build, deploy, newsletter
```

---

## Tech Stack

| Layer | Stack |
|---|---|
| Frontend | React 18 · TypeScript · Vite · TailwindCSS · ShadCN/UI |
| Backend scripts | Python 3.11 · psycopg |
| Database (articles/news) | Neon (PostgreSQL) |
| Database + API (newsletter) | Supabase (PostgreSQL + Edge Functions) — temporary, pending migration to Neon |
| Site hosting | GitHub Pages |
| Email | Resend |
| Automation | GitHub Actions |
| External APIs | Alternative.me · RSS Feeds |
| Extension | Chrome Manifest V3 |

---

## Changelog

### v1.0 — Initial Release
- BTC/USD and BTC/BRL live price section
- Daily Bitcoin news aggregation via RSS feeds (PT-BR sources)
- Fear & Greed Index via Alternative.me API
- FIAT ⇄ BTC converter
- Support section with Lightning Network donation
- Python scraping pipeline with PostgreSQL
- GitHub Actions automation: scrape, build JSON, deploy
- Static hosting on GitHub Pages

### v1.5 — Monorepo + Newsletter + Extension
- Merged site and scripts into a single monorepo (`guibim/btcheck`)
- Separated news by language: PT-BR and EN feeds (14 RSS sources total)
- Added EN language support throughout the site (PT-BR / EN toggle)
- Light / dark theme toggle
- Weekly newsletter system (PT-BR and EN) via Resend
- Subscribe / unsubscribe via Supabase Edge Functions (no external server needed)
- Database migrated to Supabase (PostgreSQL + Edge Functions)
- Bitcoin Whitepaper page (`/paper`) — PDF switches by active language
- Chrome Extension (MV3): live price, Fear & Greed, quick converter
- Updated GitHub Actions workflows: `build_news`, `build_price`, `deploy`, `newsletter`

---

## Author

**Guilherme Bim** — [github.com/guibim](https://github.com/guibim)
