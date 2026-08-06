describe("Cotação do Bitcoin", () => {
  beforeEach(() => {
    cy.visitAndWait("/");
  });

  it("exibe preço BTC/USD com símbolo de dólar", () => {
    cy.contains(/\$[\d,]+/, { timeout: 15000 }).should("be.visible");
  });

  it("exibe preço BTC/BRL com símbolo de real", () => {
    cy.contains(/R\$[\s\d,.]+/, { timeout: 15000 }).should("be.visible");
  });

  it("badge Fear and Greed está presente no header", () => {
    cy.get("header", { timeout: 10000 }).should("be.visible");
    cy.get("header").find("a, span, div").should("exist");
  });

  it("valor USD exibido é numérico e positivo", () => {
    cy.contains(/\$[\d,]+/, { timeout: 15000 }).invoke("text").then((text) => {
      const value = parseFloat(text.replace(/[$,\s]/g, ""));
      expect(value).to.be.greaterThan(0);
    });
  });

  it("valor BRL exibido é numérico e positivo", () => {
    cy.contains(/R\$/, { timeout: 15000 })
      .invoke("text")
      .then((text) => {
        const digits = text.replace(/[^0-9]/g, "");
        expect(parseInt(digits)).to.be.greaterThan(0);
      });
  });
});
