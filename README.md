# 🟠 btcheck — Bitcoin News & Price Feed

**PT-BR:** Backend e automação para coleta de notícias e cotação do Bitcoin em português.  
**EN:** Backend and automation to fetch Bitcoin news (in Portuguese) and price data.

---

## 🌍 Descrição (PT-BR)

**btcheck** é um projeto *open-source* que coleta automaticamente as últimas notícias sobre **Bitcoin** em português e a cotação atual da moeda, disponibilizando tudo em formato **JSON público** — ideal para ser consumido por websites, como o front-end desenvolvido no **Loveable**.

---

## 🔎 Funcionalidades Principais

### 📰 Coleta Automática de Notícias
Realizada duas vezes por dia, a partir de fontes **RSS confiáveis**:
- [InfoMoney Cripto](https://www.infomoney.com.br/criptomoedas/)
- [Exame Cripto](https://exame.com/cripto/)
- [Livecoins](https://www.livecoins.com.br/)
- [Cointelegraph Brasil](https://br.cointelegraph.com/)
- [Portal do Bitcoin](https://portaldobitcoin.uol.com.br/)

### 💰 Cotação BTC/USD
Cotação atual do Bitcoin em **dólares (USD)** obtida via [CoinGecko API](https://www.coingecko.com/).

### 💾 Banco de Dados
Armazenamento das notícias em **PostgreSQL (Neon DB)**.

### ⚙️ Publicação Automatizada
Processo automatizado com **GitHub Actions**, que gera e publica:
- `news.json` — lista de notícias
- `btc_price.json` — cotação atual

### 🌐 Integração Simples com o Front-end
Integração com **Loveable**, via chamadas `fetch()` aos arquivos JSON hospedados em:
- Em processo de alteração

---

## 🇺🇸 Description (EN)

**btcheck** is an open-source project that automatically collects the latest **Bitcoin-related news** (in Portuguese) and the current **BTC/USD price**, exposing both as public **JSON files** — ideal for integration with front-ends like **Loveable**.

---

## 🔎 Main Features

### 📰 Automated News Collection
Runs twice a day, fetching from reliable RSS sources:
- InfoMoney Cripto  
- Exame Cripto  
- Livecoins  
- Cointelegraph Brasil  
- Portal do Bitcoin  

### 💰 Bitcoin Price (USD)
Fetched from **CoinGecko API**.

### 💾 Database
News stored in **PostgreSQL (Neon DB)**.

### ⚙️ Automated Publishing
Using **GitHub Actions** to generate:
- `news.json` — latest news  
- `btc_price.json` — current BTC price  

### 🌐 Front-end Integration
Easily integrated with **Loveable** via simple `fetch()` calls.

---

## 🧩 Roadmap — btcheck

### 🎯 Fase 1 — Próximos Passos
- 💡 **Aba “Apoie o Projeto”** — Sistema de doação via **Lightning Network**.  
- 🗓️ **Histórico de Notícias** — Exibição de notícias passadas por data específica.  
- 🔎 **Filtro de Pesquisa** — Busca por palavra-chave e data.

### 🚀 Fase 2 — Aprimoramentos
- 🏷️ **Categorias de Notícias** — Classificação por *mercado*, *mineração*, *regulação*, *inovação*, etc.  
- 📈 **Histórico de Preços BTC/USD** — Gráfico de variação baseado no JSON atualizado duas vezes ao dia.

### 🌎 Fase 3 — Expansão
- 🌍 **Internacionalização (EN)** — Suporte multilíngue (PT-BR / EN), com detecção automática e alternância manual.

---

## 🧑‍💻 Autor

**Guilherme Bim**  
Projeto: **btcheck**  
[GitHub @guibim](https://github.com/guibim)
