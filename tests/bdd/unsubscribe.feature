Feature: Página de cancelamento de inscrição

  Scenario: Acessar a página de unsubscribe diretamente
    When acesso diretamente "/unsubscribe"
    Then vejo o formulário de cancelamento
    And vejo o campo de e-mail para cancelamento

  Scenario: Botão de cancelar está desabilitado sem e-mail
    When acesso diretamente "/unsubscribe"
    Then o botão de cancelar inscrição está desabilitado

  Scenario: Botão de cancelar fica ativo ao preencher e-mail
    When acesso diretamente "/unsubscribe"
    And digito "usuario@exemplo.com" no campo de e-mail do unsubscribe
    Then o botão de cancelar inscrição está ativo

  Scenario: Cancelamento via token na URL mostra estado de loading
    When acesso "/unsubscribe?token=token-de-teste-qualquer"
    Then vejo o estado de carregamento do cancelamento

  Scenario: Unsubscribe respeita idioma ativo em PT-BR
    Given o idioma está configurado como "pt-BR"
    When acesso diretamente "/unsubscribe"
    Then vejo o título de cancelamento em português

  Scenario: Unsubscribe respeita idioma ativo em EN
    Given o idioma está configurado como "en"
    When acesso diretamente "/unsubscribe"
    Then vejo o título de cancelamento em inglês
