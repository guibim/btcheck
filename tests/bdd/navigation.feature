Feature: Navegação geral do site

  Background:
    Given que estou na página inicial

  Scenario: Página inicial carrega com sucesso
    Then vejo o título "btcheck" no header
    And vejo as abas "Cotação & Notícias" e "Apoie"

  Scenario: Navegar para a página do Whitepaper
    When clico no botão "Bitcoin Paper" no header
    Then a URL contém "/paper"
    And vejo o iframe do PDF

  Scenario: Navegar para a página de Newsletter
    When clico no botão de newsletter no header
    Then a URL contém "/newsletter"
    And vejo o formulário de inscrição

  Scenario: Navegar para Unsubscribe
    When acesso diretamente "/unsubscribe"
    Then vejo o formulário de cancelamento

  Scenario: Navegar de volta para home pelo logo/botão Home
    Given que estou na página "/paper"
    When clico no botão Home no header
    Then a URL termina com "/"
    And vejo as abas "Cotação & Notícias" e "Apoie"

  Scenario: Aba Apoie exibe seção de suporte
    When clico na aba "Apoie"
    Then vejo a seção de apoio ao projeto

  Scenario: Rota inexistente exibe página 404
    When acesso diretamente "/pagina-que-nao-existe"
    Then vejo uma mensagem de página não encontrada
