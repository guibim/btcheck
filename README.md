# 📰 BTCheck — Bitcoin News & Price Feed 1.0

**PT-BR:** Projeto pessoal open-source desenvolvido para **facilitar o acesso a informações atualizadas sobre o Bitcoin**, reunindo automaticamente as principais notícias diárias, exibindo a cotação em tempo real e oferecendo um conversor de moedas FIAT ⇄ BTC.  
**EN:** Open-source personal project that automatically aggregates daily **Bitcoin news (PT-BR)**, shows live BTC/USD and BTC/BRL prices, and includes a simple fiat-to-Bitcoin converter.

---

## 🌍 Descrição do Projeto

O **BTCheck** integra **web scraping, APIs públicas e automações** para reunir, organizar e disponibilizar informações confiáveis sobre o **mercado Bitcoin**.  
As notícias são coletadas por *scripts* em Python, armazenadas em um banco de dados **PostgreSQL (NeonDB)** e publicadas em formato **JSON** para leitura pelo front-end hospedado na **Lovable.app**.  

O projeto é **pessoal e em constante aprimoramento**, atualmente em processo de migração de host e expansão de funcionalidades, incluindo o desenvolvimento de uma **newsletter semanal** com as principais notícias do Bitcoin.

🔗 [Repositório para testes E2E do projeto](https://github.com/guibim/btcheck-tests)

---

## ⚙️ Estrutura Principal

- **`scrape.py`** → coleta notícias de fontes RSS e salva no banco de dados.  
- **`get_btc_price.py`** → obtém a cotação do Bitcoin em USD e BRL via API CoinGecko.  
- **`build_json.py`** → gera o arquivo `news.json`, utilizado pelo front-end (reutilizável em outros projetos).  
- **`api_by_date/`** → API própria para consultar notícias de dias anteriores e obter cotações históricas via API Binance. > Desativada em 03/12/25 

---

## ✅ Funcionalidades Concluídas

| Data  | Atualização |
|-------|--------------|
| 27/10/25 | Aba “Apoie o Projeto” com sistema de doação via Lightning Network |
| 27/10/25 | Créditos adicionados no rodapé |
| 27/10/25 | Conversor BTC ⇄ USD / BRL na seção de cotação |
| 27/10/25 | Ajuste de chamadas da API CoinGecko (30/dia distribuídas em 24h) |
| 28/10/25 | Histórico de notícias por data (API /by-date) | > Desativada em 03/12/25 
| 28/10/25 | Remoção da fonte InfoMoney Cripto; manutenção da Exame Cripto |
| 28/10/25 | Organização geral do projeto e revisão de documentação |
| 29/10/25 | Remoção de imagens das notícias (tratamento mais limpo) |
| 29/10/25 | Remoção temporária da aba “Notícias Anteriores” (preparação para rolagem infinita) |
| 04/11/25 | Implementação do índice de medo e ganância (Fear & Greed) via API Alternative.me |
| 10/11/25 | Reestruturação do bloco de cotação com botão “Cotações anteriores” integrado à API pública da Binance |
| 10/11/25 | Implementação do painel de métricas (Google Analytics) |
| 10/11/25 | Estruturação dos casos de teste automatizados (Robot Framework e Cypress) — [Acessar repositório](https://github.com/guibim/btcheck-tests) |
| 19/11/25 | **Novo endereço do site:** [btcheck-site](https://guibim.github.io/btcheck-site/) |
| 03/12/25 | Tratamento de Banco de Dados concluído |
| 03/12/25 | Documentação concluída v1.0 |

---

## 🧩 Tecnologias Utilizadas

**Backend:** Python · FastAPI · PostgreSQL (NeonDB)  
**Frontend:** React · TypeScript · TailwindCSS · ShadCN/UI  
**Automação:** GitHub Actions  
**APIs:** CoinGecko · Binance · Alternative.me · RSS Feeds (Exame Cripto, Livecoins, etc.)  
**Infraestrutura:** Lovable.app Hosting

---

## 🚧 Funcionalidades a Implementar

| Status | Atualização |
|--------|-------------|
| 🔄 | Newsletter e sistema de cadastro de usuários — *Ainda será implementado* |
---

## 👨‍💻 Desenvolvido por

**Guilherme Bim**  
[github.com/guibim](https://github.com/guibim)  

**Site:** [btcheck-site](https://guibim.github.io/btcheck-site/)
