describe("Alternância de tema", () => {
  it("tema padrão é escuro", () => {
    cy.visitAndWait("/");
    cy.get("html").should("have.class", "dark");
  });

  it("clicar no botão alterna para tema claro", () => {
    cy.visitAndWait("/");
    cy.get("header").find("button").filter(':has(.lucide-moon)').click();
    cy.get("html").should("not.have.class", "dark");
  });

  it("clicar novamente volta para tema escuro", () => {
    cy.setTheme("light");
    cy.visitAndWait("/");
    cy.get("header").find("button").filter(':has(.lucide-sun)').click();
    cy.get("html").should("have.class", "dark");
  });

  it("tema claro persiste após recarregar", () => {
    cy.setTheme("light");
    cy.visitAndWait("/");
    cy.get("html").should("not.have.class", "dark");
  });

  it("tema escuro persiste após recarregar", () => {
    cy.setTheme("dark");
    cy.visitAndWait("/");
    cy.get("html").should("have.class", "dark");
  });
});
