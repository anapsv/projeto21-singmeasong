const URL_FRONT = "http://localhost:3000";
const URL_BACK = "http://localhost:5000";

beforeEach(async () => {
    await cy.request('POST', `${URL_BACK}/e2e/reset`, {});
});

describe('Navigate between pages', () => {
    it('should navigate to top page successfully, and have at most 10 recommendations', () => {
        for (let i = 0; i < 15; i++) {
            cy.createRecommendation(URL_BACK);
        }

        cy.visit(URL_FRONT);

        cy.intercept('GET', `${URL_BACK}/recommendations/top/10`).as('getTopRecommendations');

        cy.get("[data-cy=top]").click();

        cy.wait('@getTopRecommendations');

        cy.url().should('equal', `${URL_FRONT}/top`);

        cy.get("[data-cy=title]").should('have.length', 10);
    });

    it('should navigate to random page successfully, and have only 1 recommendation', () => {
        for (let i = 0; i < 15; i++) {
            cy.createRecommendation(URL_BACK);
        }

        cy.visit(URL_FRONT);

        cy.intercept('GET', `${URL_BACK}/recommendations/random`).as('getRandomRecommendations');

        cy.get("[data-cy=random]").click();

        cy.wait('@getRandomRecommendations');

        cy.url().should('equal', `${URL_FRONT}/random`);

        cy.get("[data-cy=title]").should('have.length', 1);
    });

    it('should navigate to home page successfully, and have at most 10 recommendations', () => {
        for (let i = 0; i < 15; i++) {
            cy.createRecommendation(URL_BACK);
        }

        cy.visit(URL_FRONT);

        cy.intercept('GET', `${URL_BACK}/recommendations`).as('getRecommendations');

        cy.get("[data-cy=home]").click();

        cy.wait('@getRecommendations');

        cy.url().should('equal', `${URL_FRONT}/`);

        cy.get("[data-cy=title]").should('have.length', 10);
    });
});