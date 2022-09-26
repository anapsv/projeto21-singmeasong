import { faker } from "@faker-js/faker";

export async function recommendationBody() {
    return {
        name: faker.lorem.words(5),
        youtubeLink: "https://www.youtube.com/watch?v=chwyjJbcs1Y"
    };
}

export async function recommendationData() {
    return {
        id: Number(faker.finance.amount(1, 200, 0)),
        name: faker.lorem.words(5),
        youtubeLink: "https://www.youtube.com/watch?v=chwyjJbcs1Y",
        score: 0
    };
}

export async function multipleItems(min: number, max: number) {
    const result = [];
    for (let i = 0; i < 10; i++) {
        const item = {
            id: i,
            name: `${i} - ${faker.lorem.words(5)}`,
            youtubeLink: "https://www.youtube.com/watch?v=chwyjJbcs1Y",
            score: Number(faker.finance.amount(min, max, 0))
        };
        result.push(item);
    }
    return result;
}