Feature: Página do Bitcoin Whitepaper

  Scenario: Acessar a página do Whitepaper
    Given que estou na página inicial
    When clico no botão "Bitcoin Paper" no header
    Then a URL contém "/paper"
    And vejo o iframe do PDF

  Scenario: PDF em PT-BR quando idioma é português
    Given o idioma está configurado como "pt-BR"
    When acesso diretamente "/paper"
    Then o iframe aponta para o PDF em português

  Scenario: PDF em inglês quando idioma é inglês
    Given o idioma está configurado como "en"
    When acesso diretamente "/paper"
    Then o iframe aponta para o PDF em inglês

  Scenario: Botão de voltar retorna à home
    Given acesso diretamente "/paper"
    When clico no botão de voltar na página do Paper
    Then a URL termina com "/"

  Scenario: Link de download está presente
    When acesso diretamente "/paper"
    Then vejo o link de download do PDF
