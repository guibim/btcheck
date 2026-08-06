Feature: Troca de idioma PT-BR e EN

  Background:
    Given que estou na página inicial

  Scenario: Idioma padrão é PT-BR
    Then o header exibe título em português

  Scenario: Trocar idioma para inglês via dropdown
    When abro o dropdown de idioma
    And seleciono "English"
    Then o header exibe título em inglês
    And a aba principal exibe texto em inglês

  Scenario: Trocar idioma para português via dropdown
    Given o idioma está configurado como "en"
    When recarrego a página
    And abro o dropdown de idioma
    And seleciono "Português"
    Then o header exibe título em português

  Scenario: Idioma persiste após recarregar a página
    Given o idioma está configurado como "en"
    When recarrego a página
    Then o header exibe título em inglês

  Scenario: Notícias mudam conforme idioma selecionado
    Given o idioma está configurado como "pt-BR"
    When a página carrega
    Then vejo a fonte "Livecoins" nos artigos
    When o idioma está configurado como "en"
    And recarrego a página
    Then vejo a fonte "CoinDesk" nos artigos

  Scenario: Página de Newsletter respeita idioma ativo
    Given o idioma está configurado como "en"
    When acesso diretamente "/newsletter"
    Then vejo o formulário de inscrição em inglês
