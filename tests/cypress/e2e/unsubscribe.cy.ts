describe("Página de Cancelamento (Unsubscribe)", () => {
  it("acessa /unsubscribe e exibe formulário com campo de e-mail", () => {
    cy.visitAndWait("/unsubscribe");
    cy.get('input[type="email"]').should("be.visible");
  });

  it("botão de cancelar começa desabilitado sem e-mail", () => {
    cy.visitAndWait("/unsubscribe");
    cy.get('button[type="submit"]').should("be.disabled");
  });

  it("botão fica ativo ao digitar e-mail válido", () => {
    cy.visitAndWait("/unsubscribe");
    cy.get('input[type="email"]').type("usuario@exemplo.com");
    cy.get('button[type="submit"]').should("not.be.disabled");
  });

  it("botão volta a ficar desabilitado ao limpar o campo", () => {
    cy.visitAndWait("/unsubscribe");
    cy.get('input[type="email"]').type("usuario@exemplo.com");
    cy.get('button[type="submit"]').should("not.be.disabled");
    cy.get('input[type="email"]').clear();
    cy.get('button[type="submit"]').should("be.disabled");
  });

  it("exibe estado de loading ao acessar com token na URL", () => {
    cy.intercept("POST", "**/functions/v1/unsubscribe", {
      delay: 800,
      statusCode: 200,
      body: { status: "unsubscribed" },
    }).as("unsubApi");

    cy.visitAndWait("/unsubscribe?token=token-teste-cypress");
    cy.contains(/carregando|loading|aguarde/i, { timeout: 5000 }).should("be.visible");
  });

  it("respeita idioma PT-BR", () => {
    cy.setLanguage("pt-BR");
    cy.visitAndWait("/unsubscribe");
    cy.get("main").contains(/cancelar|inscrição/i).should("exist");
  });

  it("respeita idioma EN", () => {
    cy.setLanguage("en");
    cy.visitAndWait("/unsubscribe");
    cy.get("main").contains(/unsubscribe|cancel/i).should("exist");
  });
});
