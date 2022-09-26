const URL_FRONT = "http://localhost:3000";
const URL_BACK = "http://localhost:5000";

beforeEach(async () => {
    await cy.request('POST', `${URL_BACK}/e2e/reset`, {});
});

describe('Vote recommendation', () => {
    it('upvote: should increase score in 1', () => {
        cy.createRecommendation(URL_BACK);

        cy.visit(URL_FRONT);

        cy.get("[data-cy=upvote]").click();

        cy.get("[data-cy=score]").should('contain', '1');
    });

    it('downvote: should decrease score in 1', () => {
        cy.createRecommendation(URL_BACK);

        cy.visit(URL_FRONT);

        cy.get("[data-cy=downvote]").click();

        cy.get("[data-cy=score]").should('contain', '-1');
    });

    it('downvote: should delete recommendation when score is less than -5', () => {
        cy.createRecommendation(URL_BACK);

        cy.visit(URL_FRONT);

        cy.get("[data-cy=downvote]").click();
        cy.wait(500);
        cy.get("[data-cy=downvote]").click();
        cy.wait(500);
        cy.get("[data-cy=downvote]").click();
        cy.wait(500);
        cy.get("[data-cy=downvote]").click();
        cy.wait(500);
        cy.get("[data-cy=downvote]").click();
        cy.wait(500);
        cy.get("[data-cy=downvote]").click();
        cy.wait(500);

        cy.get("[data-cy=emptyRecommendations]").should("be.visible");
    });

    it('on page top, the first recommendation should go down when downvoted', () => {
        cy.createRecommendation(URL_BACK);
        cy.createRecommendation(URL_BACK);

        cy.visit(`${URL_FRONT}/top`);

        cy.get("[data-cy=title]").eq(0).then((title) => {
            const txt = title.text();

            cy.intercept('GET', `${URL_BACK}/recommendations/top/10`).as('getTopRecommendations');

            cy.get("[data-cy=downvote]").eq(0).click();

            cy.wait('@getTopRecommendations');

            cy.get("[data-cy=title]").eq(0).should('not.have.value', txt);
        });
    });

    it('on page top, the second recommendation should go up when upvoted', () => {
        cy.createRecommendation(URL_BACK);
        cy.createRecommendation(URL_BACK);

        cy.visit(`${URL_FRONT}/top`);

        cy.get("[data-cy=title]").eq(0).then((title) => {
            const txt = title.text();

            cy.intercept('GET', `${URL_BACK}/recommendations/top/10`).as('getTopRecommendations');

            cy.get("[data-cy=upvote]").eq(1).click();

            cy.wait('@getTopRecommendations');

            cy.get("[data-cy=title]").eq(0).should('not.have.value', txt);
        });
    });
});