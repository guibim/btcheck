describe("Conversor FIAT ⇄ BTC", () => {
  beforeEach(() => {
    cy.visitAndWait("/");
    // Aguarda cotação carregar antes de converter
    cy.contains(/\$[\d,]+/, { timeout: 15000 }).should("be.visible");
  });

  const getConverterInput = () =>
    cy.get("input").filter(":visible").not('[type="email"]').not('[type="search"]').first();

  it("converte BRL para BTC e exibe resultado", () => {
    cy.contains("button", /BRL.*BTC/i).click();
    getConverterInput().clear().type("10000");
    cy.contains(/[\d.]+\s*BTC/i, { timeout: 5000 }).should("be.visible");
  });

  it("converte USD para BTC e exibe resultado", () => {
    cy.contains("button", /USD.*BTC/i).click();
    getConverterInput().clear().type("1000");
    cy.contains(/[\d.]+\s*BTC/i, { timeout: 5000 }).should("be.visible");
  });

  it("converte BTC para Fiat e exibe USD e BRL", () => {
    cy.contains("button", /BTC.*Fiat/i).click();
    getConverterInput().clear().type("0.5");
    cy.contains(/\$[\d,]+/, { timeout: 5000 }).should("be.visible");
    cy.contains(/R\$/, { timeout: 5000 }).should("be.visible");
  });

  it("limpar o campo remove o resultado da conversão", () => {
    cy.contains("button", /BRL.*BTC/i).click();
    getConverterInput().clear().type("5000");
    cy.contains(/[\d.]+\s*BTC/i, { timeout: 5000 }).should("be.visible");
    getConverterInput().clear();
    cy.contains(/[\d.]+\s*BTC/i).should("not.exist");
  });

  it("troca entre os três modos de conversão", () => {
    cy.contains("button", /BRL.*BTC/i).click();
    cy.contains("button", /BRL.*BTC/i).should("have.class", /primary|active|border-primary/);

    cy.contains("button", /USD.*BTC/i).click();
    cy.contains("button", /USD.*BTC/i).should("have.class", /primary|active|border-primary/);

    cy.contains("button", /BTC.*Fiat/i).click();
    cy.contains("button", /BTC.*Fiat/i).should("have.class", /primary|active|border-primary/);
  });
});
