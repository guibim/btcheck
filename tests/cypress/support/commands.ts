declare global {
  namespace Cypress {
    interface Chainable {
      setLanguage(lang: "pt-BR" | "en"): void;
      setTheme(theme: "light" | "dark"): void;
      visitAndWait(path?: string): void;
    }
  }
}

Cypress.Commands.add("setLanguage", (lang: "pt-BR" | "en") => {
  cy.window().then((win) => {
    win.localStorage.setItem("btcheck-language", lang);
  });
});

Cypress.Commands.add("setTheme", (theme: "light" | "dark") => {
  cy.window().then((win) => {
    win.localStorage.setItem("btcheck-theme", theme);
  });
});

// Visita e aguarda o React montar
Cypress.Commands.add("visitAndWait", (path = "/") => {
  cy.visit(path);
  cy.get("header", { timeout: 15000 }).should("be.visible");
});

export {};
