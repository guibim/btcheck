describe("Navegação geral", () => {
  beforeEach(() => {
    cy.visitAndWait("/");
  });

  it("página inicial carrega com o título btcheck no header", () => {
    cy.get("header").contains("btcheck").should("be.visible");
  });

  it("exibe as duas abas principais", () => {
    cy.get('[role="tab"]').should("have.length.at.least", 2);
  });

  it("navega para o Whitepaper pelo botão no header", () => {
    cy.get("header").find("button").filter(':has(.lucide-file-text)').click();
    cy.url().should("include", "/paper");
    cy.get("iframe", { timeout: 10000 }).should("exist");
  });

  it("navega para Newsletter pelo ícone de e-mail no header", () => {
    cy.get("header").find("button").filter(':has(.lucide-mail)').click();
    cy.url().should("include", "/newsletter");
    cy.get('input[type="email"]').should("be.visible");
  });

  it("botão Home retorna para a página inicial", () => {
    cy.visitAndWait("/paper");
    cy.get('button[title="Home"]').click();
    cy.get('[role="tab"]', { timeout: 10000 }).should("exist");
  });

  it("aba Apoie exibe seção de suporte", () => {
    cy.get('[role="tab"]').eq(1).click();
    cy.get("main").contains(/apoie|lightning|suporte/i).should("exist");
  });

  it("rota inexistente exibe página 404", () => {
    cy.visit("/rota-que-nao-existe", { failOnStatusCode: false });
    cy.get("body", { timeout: 15000 }).contains(/404|não encontrada|not found/i).should("exist");
  });
});
