describe("Seção de Notícias", () => {
  it("exibe artigos PT-BR no idioma padrão", () => {
    cy.setLanguage("pt-BR");
    cy.visitAndWait("/");
    cy.get("article", { timeout: 20000 }).should("have.length.greaterThan", 0);
  });

  it("exibe artigos EN ao configurar idioma inglês", () => {
    cy.setLanguage("en");
    cy.visitAndWait("/");
    cy.get("article", { timeout: 20000 }).should("have.length.greaterThan", 0);
  });

  it("cada artigo exibe título não vazio", () => {
    cy.visitAndWait("/");
    cy.get("article", { timeout: 20000 }).each(($article) => {
      cy.wrap($article).find("h3").should("not.be.empty");
    });
  });

  it("cada artigo exibe data no formato correto", () => {
    cy.visitAndWait("/");
    cy.get("article", { timeout: 20000 }).each(($article) => {
      cy.wrap($article).contains(/\d{2}\/\d{2}\/\d{4}/).should("exist");
    });
  });

  it("títulos dos artigos são links externos válidos", () => {
    cy.visitAndWait("/");
    cy.get("article h3 a", { timeout: 20000 }).each(($link) => {
      cy.wrap($link)
        .should("have.attr", "href")
        .and("match", /^https?:\/\//);
      cy.wrap($link).should("have.attr", "target", "_blank");
    });
  });

  it("notícias mudam ao trocar idioma", () => {
    cy.setLanguage("pt-BR");
    cy.visitAndWait("/");
    cy.get("article", { timeout: 20000 }).first().invoke("text").then((textPT) => {
      cy.setLanguage("en");
      cy.reload();
      cy.get("article", { timeout: 20000 }).first().invoke("text").then((textEN) => {
        expect(textPT).not.to.equal(textEN);
      });
    });
  });
});
