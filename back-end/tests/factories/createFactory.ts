import * as recommendationFactory from "./recommendationFactory.js";
import { prisma } from "../../src/database";
import { faker } from "@faker-js/faker";

export async function create() {
    const body = await recommendationFactory.recommendationBody();

    const createdRecommendation = await prisma.recommendation.create({
        data: body
    });
    return createdRecommendation;
}

export async function createWithLowScore() {
    const body = await recommendationFactory.recommendationBody();

    const createdRecommendation = await prisma.recommendation.create({
        data: { ...body, score: -5 }
    });
    return createdRecommendation;
}

export async function createMultipleItems(amount?: number) {
    for (let i = 0; i < 11; i++) {
        const body = await recommendationFactory.recommendationBody();

        await prisma.recommendation.create({
            data: {
                name: `${i} - ${body.name}`,
                youtubeLink: body.youtubeLink,
                score: amount ? Number(faker.finance.amount(-5, 200, 0)) : 0
            }
        });
    }
    return;
}