Feature: Alternância de tema claro e escuro

  Background:
    Given que estou na página inicial

  Scenario: Tema padrão é escuro
    Then o elemento raiz tem classe de tema escuro

  Scenario: Alternar para tema claro
    When clico no botão de tema
    Then o elemento raiz tem classe de tema claro

  Scenario: Alternar de volta para tema escuro
    Given o tema está configurado como "light"
    When recarrego a página
    And clico no botão de tema
    Then o elemento raiz tem classe de tema escuro

  Scenario: Tema persiste após recarregar a página
    Given o tema está configurado como "light"
    When recarrego a página
    Then o elemento raiz tem classe de tema claro
