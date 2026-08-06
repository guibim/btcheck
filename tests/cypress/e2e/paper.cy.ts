describe("Página do Bitcoin Whitepaper", () => {
  it("botão no header navega para /paper", () => {
    cy.visitAndWait("/");
    cy.get("header").find("button").filter(':has(.lucide-file-text)').click();
    cy.url().should("include", "/paper");
  });

  it("exibe iframe com o PDF", () => {
    cy.visitAndWait("/paper");
    cy.get("iframe", { timeout: 10000 }).should("be.visible");
  });

  it("PDF em PT-BR quando idioma é português", () => {
    cy.setLanguage("pt-BR");
    cy.visitAndWait("/paper");
    cy.get("iframe").should("have.attr", "src").and("include", "bitcoin_pt_br.pdf");
  });

  it("PDF em EN quando idioma é inglês", () => {
    cy.setLanguage("en");
    cy.visitAndWait("/paper");
    cy.get("iframe")
      .should("have.attr", "src")
      .and("include", "bitcoin.pdf")
      .and("not.include", "pt_br");
  });

  it("botão de voltar retorna para home", () => {
    cy.visitAndWait("/paper");
    cy.contains("button", /voltar|back/i).click();
    cy.get('[role="tab"]', { timeout: 10000 }).should("exist");
  });

  it("link de download do PDF está presente e aponta para arquivo .pdf", () => {
    cy.visitAndWait("/paper");
    cy.get("a").filter('[href*=".pdf"]').should("exist");
  });
});
