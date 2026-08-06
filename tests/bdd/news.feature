Feature: Seção de notícias

  Background:
    Given que estou na página inicial

  Scenario: Notícias PT-BR carregam no idioma padrão
    Given o idioma está configurado como "pt-BR"
    When a página carrega
    Then vejo artigos de notícias exibidos
    And vejo a fonte "Livecoins" nos artigos

  Scenario: Notícias EN carregam ao trocar idioma para inglês
    Given o idioma está configurado como "en"
    When a página carrega
    Then vejo artigos de notícias exibidos
    And vejo a fonte "CoinDesk" nos artigos

  Scenario: Cada artigo exibe título, fonte e data
    Given o idioma está configurado como "pt-BR"
    When a página carrega
    Then cada artigo exibe um título
    And cada artigo exibe uma fonte
    And cada artigo exibe uma data

  Scenario: Título do artigo é um link clicável
    Given o idioma está configurado como "pt-BR"
    When a página carrega
    Then os títulos dos artigos são links com href válido

  Scenario: Skeleton de loading é exibido antes dos dados
    When acesso a página antes dos dados carregarem
    Then vejo o skeleton de carregamento das notícias
