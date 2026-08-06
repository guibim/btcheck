describe("Troca de idioma PT-BR / EN", () => {
  it("idioma padrão exibe textos em português", () => {
    cy.visitAndWait("/");
    cy.get('[role="tab"]').first().contains(/cotação|notícias/i).should("exist");
  });

  it("trocar para EN via dropdown muda textos do site", () => {
    cy.visitAndWait("/");
    cy.get("header").find("button").filter(':has(.lucide-globe)').click();
    cy.contains('[role="menuitem"]', /english/i).click();
    cy.get('[role="tab"]').first().contains(/quote|news|price/i).should("exist");
  });

  it("idioma EN persiste após recarregar", () => {
    cy.setLanguage("en");
    cy.visitAndWait("/");
    cy.get('[role="tab"]').first().contains(/quote|news|price/i).should("exist");
  });

  it("idioma PT-BR persiste após recarregar", () => {
    cy.setLanguage("pt-BR");
    cy.visitAndWait("/");
    cy.get('[role="tab"]').first().contains(/cotação|notícias/i).should("exist");
  });

  it("página Newsletter respeita idioma EN", () => {
    cy.setLanguage("en");
    cy.visitAndWait("/newsletter");
    cy.get("main").contains(/receive|subscribe|weekly/i).should("exist");
  });

  it("página Unsubscribe respeita idioma EN", () => {
    cy.setLanguage("en");
    cy.visitAndWait("/unsubscribe");
    cy.get("main").contains(/unsubscribe|cancel/i).should("exist");
  });

  it("página Unsubscribe respeita idioma PT-BR", () => {
    cy.setLanguage("pt-BR");
    cy.visitAndWait("/unsubscribe");
    cy.get("main").contains(/cancelar|inscrição/i).should("exist");
  });
});
