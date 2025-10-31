# 📰 BTCheck — Bitcoin News & Price Feed

**PT-BR:** Projeto pessoal open-source desenvolvido para **facilitar o acesso a informações atualizadas sobre o Bitcoin**, reunindo automaticamente as principais notícias diárias, exibindo a cotação em tempo real e oferecendo um conversor de moedas FIAT ⇄ BTC.  
**EN:** Open-source personal project that automatically aggregates daily **Bitcoin news (PT-BR)**, shows live BTC/USD and BTC/BRL prices, and includes a simple fiat-to-Bitcoin converter.

---

## 🌍 Descrição do Projeto

O **BTCheck** integra **web scraping, APIs públicas e automações** para reunir, organizar e disponibilizar informações confiáveis sobre o **mercado Bitcoin**.  
As notícias são coletadas por *scripts* em Python, armazenadas em um banco de dados **PostgreSQL (NeonDB)** e publicadas em formato **JSON** para leitura pelo front-end hospedado na **Lovable.app**.  

O projeto é **pessoal e em constante aprimoramento**, atualmente em processo de migração de host e expansão de funcionalidades, incluindo o desenvolvimento de uma **newsletter semanal** com as principais notícias do Bitcoin.

---

## ⚙️ Estrutura Principal

- **`scrape.py`** → coleta notícias de fontes RSS e salva no banco de dados.  
- **`get_btc_price.py`** → obtém a cotação do Bitcoin em USD e BRL via API CoinGecko.  
- **`build_json.py`** → gera o arquivo `news.json`, utilizado pelo front-end (reutilizável em outros projetos).  
- **`api_by_date/`** → API própria para consultar notícias de dias anteriores e obter cotações históricas via API Binance.

---

## ✅ Funcionalidades Concluídas

| Data  | Atualização |
|-------|--------------|
| 27/10 | Aba “Apoie o Projeto” com sistema de doação via Lightning Network |
| 27/10 | Créditos adicionados no rodapé |
| 27/10 | Conversor BTC ⇄ USD / BRL na seção de cotação |
| 27/10 | Ajuste de chamadas da API CoinGecko (30/dia distribuídas em 24h) |
| 28/10 | Histórico de notícias por data (API `/by-date`) |
| 28/10 | Remoção da fonte InfoMoney Cripto; manutenção da Exame Cripto |
| 28/10 | Organização geral do projeto e revisão de documentação |
| 29/10 | Remoção de imagens das notícias (tratamento mais limpo) |
| 29/10 | Remoção temporária da aba “Notícias Anteriores” (preparação para rolagem infinita) |

---

## 🧩 Tecnologias Utilizadas

**Backend:** Python · FastAPI · PostgreSQL (NeonDB)  
**Frontend:** React · TypeScript · TailwindCSS · ShadCN/UI  
**Automação:** GitHub Actions  
**APIs:** CoinGecko · Binance · RSS Feeds (Exame Cripto, Livecoins, etc.)  
**Infraestrutura:** Lovable.app Hosting

---

## 💡 Melhorias em Desenvolvimento

- [ ] Reestruturação do **bloco de cotação**, com botão “Cotações anteriores” integrando API pública da **Binance**.  
- [ ] **Newsletter semanal automática**, disparada por e-mail com resumo das 20 principais notícias do dia.  
- [ ] **Documentação pública** completa do projeto.  
- [ ] Implementação de um **sistema CRUD** para estruturação futura de dados.  
- [ ] Tratamento de dados no banco para evitar limite de armazenamento.  
- [ ] Criação de **painel de métricas e estatísticas de uso** (acessos, consumo da API, etc.).  
- [ ] Estruturação dos **casos de teste automatizados** (Robot Framework e Cypress).  
  - Repositório dedicado para **E2E tests**.  
  - Repositório dedicado para **API e DB tests**.

---

## 👨‍💻 Desenvolvido por

**Guilherme Bim**  
[github.com/guibim](https://github.com/guibim)  

**Site:** [btccheck.lovable.app](https://btccheck.lovable.app) — em processo de migração para novo host
