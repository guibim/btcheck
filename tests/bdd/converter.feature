Feature: Conversor FIAT e BTC

  Background:
    Given que estou na página inicial
    And aguardo a cotação carregar

  Scenario: Converter BRL para BTC
    Given estou no modo de conversão "BRL → BTC"
    When digito "10000" no campo do conversor
    Then vejo o resultado da conversão em BTC
    And o resultado contém "BTC"

  Scenario: Converter USD para BTC
    Given estou no modo de conversão "USD → BTC"
    When digito "1000" no campo do conversor
    Then vejo o resultado da conversão em BTC
    And o resultado contém "BTC"

  Scenario: Converter BTC para Fiat
    Given estou no modo de conversão "BTC → Fiat"
    When digito "0.5" no campo do conversor
    Then vejo o resultado da conversão em dólar
    And vejo o resultado da conversão em real

  Scenario: Limpar campo zera resultado
    Given estou no modo de conversão "BRL → BTC"
    When digito "5000" no campo do conversor
    And limpo o campo do conversor
    Then o resultado da conversão não é exibido

  Scenario: Trocar entre modos de conversão
    Given estou no modo de conversão "BRL → BTC"
    When clico no modo "USD → BTC"
    Then o modo ativo é "USD → BTC"
    When clico no modo "BTC → Fiat"
    Then o modo ativo é "BTC → Fiat"
