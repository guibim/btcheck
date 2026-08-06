Feature: Exibição da cotação do Bitcoin

  Background:
    Given que estou na página inicial

  Scenario: Exibe preço BTC/USD
    Then vejo o preço em dólar exibido na seção de cotação

  Scenario: Exibe preço BTC/BRL
    Then vejo o preço em real exibido na seção de cotação

  Scenario: Exibe o índice Fear and Greed
    Then vejo o badge do Fear and Greed no header

  Scenario: Valores de preço são numéricos e positivos
    Then o valor BTC/USD contém símbolo de dólar
    And o valor BTC/BRL contém símbolo de real
