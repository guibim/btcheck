# 📰 BTCheck — Bitcoin News & Price Feed

> **PT-BR:** Plataforma open-source que coleta automaticamente as últimas notícias sobre Bitcoin em português e exibe a cotação atual da moeda.  
> **EN:** Open-source project that fetches the latest Bitcoin news (in Portuguese) and live BTC/USD price data.

---

## 🌍 Descrição do Projeto

O **BTCheck** integra *scraping*, APIs públicas e automações para reunir, organizar e disponibilizar informações sobre o mercado Bitcoin.  
As notícias são coletadas de fontes confiáveis, armazenadas em banco de dados PostgreSQL (NeonDB) e publicadas em formato JSON público, sendo consumidas pelo front-end hospedado na [Lovable.app](https://btcheck.lovable.app/).

**Principais componentes:**
- `scrape.py` → coleta notícias de fontes RSS e salva no banco de dados.  
- `get_btc_price.py` → obtém a cotação do Bitcoin em USD e BRL via API [CoinGecko](https://www.coingecko.com/).  
- `build_json.py` → gera o arquivo `news.json` lido pelo front-end (pode ser reutilizado em outros projetos).  
- `api_by_date/` → API propria que consulta o banco de dados para retornar notícias de datas anteriores e cotação histórica via API da Binance.  
---

## ✅ Concluído
| Data | Tarefa |
|------|--------|
| 27/10 | 💡 Aba “Apoie o Projeto” — sistema de doação via Lightning Network |
| 27/10 | 🔗 Adicionado créditos no rodapé |
| 27/10 | 💰 Conversor BTC → USD / BRL adicionado na seção de cotação |
| 27/10 | ⚙️ Ajuste de chamadas da API CoinGecko (30/dia distribuídas em 24h) |
| 28/10 | 🗓️ Histórico de Notícias — exibição por data específica (API `/by-date`) |
| 28/10 | 📰 Remoção da fonte InfoMoney Cripto; manutenção da Exame Cripto |
| 28/10 | 📄 Organização no Miro, revisão do README e Documentação geral do projeto

---

## ⚙️ Tecnologias Utilizadas
- **Backend:** Python · FastAPI · PostgreSQL (NeonDB)  
- **Frontend:** React · TypeScript · TailwindCSS · ShadCN/UI  
- **Automação:** GitHub Actions  
- **APIs:** CoinGecko · Binance · RSS Feeds (Exame Cripto, Livecoins, etc.)  
- **Infraestrutura:** Lovable.app Hosting  

---

## 💡 Ideias Futuras
- 🕓 Agendamento de publicações automáticas via GitHub Actions  
- 📊 Painel estatístico das fontes e engajamento  
- 🔔 Notificações push de novas notícias  
- 📬 Integração com newsletter via API  

---

## 👨‍💻 Desenvolvido por
**Guilherme Bim**  
🔗 [github.com/guibim](https://github.com/guibim)  
🚀 Projeto hospedado em [btcheck.lovable.app](https://btcheck.lovable.app/)

---

## 📄 Licença
Distribuído sob a licença MIT.
