import { recommendationService } from "../src/services/recommendationsService.js";
import { recommendationRepository } from "../src/repositories/recommendationRepository.js";
import * as recommendationFactory from "./factories/recommendationFactory.js";
import { conflictError, notFoundError } from "../src/utils/errorUtils.js";

beforeEach(() => {
    jest.resetAllMocks();
    jest.clearAllMocks();
});

describe("Tests function 'insert' of recommendationService", () => {
    it("Should create a new recommendation", async () => {
        const music = await recommendationFactory.recommendationBody();

        jest.spyOn(recommendationRepository, "findByName").mockResolvedValueOnce(null);

        jest.spyOn(recommendationRepository, "create").mockImplementationOnce((): any => { });

        await recommendationService.insert(music);

        expect(recommendationRepository.create).toBeCalled();
    });

    it("Shouldn't create a duplicated recommendation", async () => {
        const existingRecommendation = await recommendationFactory.recommendationData();

        jest.spyOn(recommendationRepository, "findByName").mockResolvedValueOnce(existingRecommendation);

        const result = recommendationService.insert({
            name: existingRecommendation.name,
            youtubeLink: existingRecommendation.youtubeLink
        });

        await expect(result).rejects.toEqual(conflictError("Recommendations names must be unique"));

        expect(recommendationRepository.create).not.toBeCalled();
    });
});

describe("Tests function 'getById' of recommendationService", () => {
    it("Should return the recommendation", async () => {
        const existingRecommendation = await recommendationFactory.recommendationData();

        jest.spyOn(recommendationRepository, "find").mockResolvedValueOnce(existingRecommendation);

        const result = await recommendationService.getById(existingRecommendation.id);

        expect(result).toMatchObject(existingRecommendation);
    });

    it("Shouldn't find the recommendation", async () => {
        const existingRecommendation = await recommendationFactory.recommendationData();

        jest.spyOn(recommendationRepository, "find").mockResolvedValueOnce(null);

        const result = recommendationService.getById(existingRecommendation.id);

        expect(result).rejects.toEqual(notFoundError());
    });
});

describe("Tests functions 'upvote' and 'downvote' of recommendationService", () => {
    it("Should increase score by 1", async () => {
        const recommendation = await recommendationFactory.recommendationData();
        const recommendationUpdated = { ...recommendation, score: recommendation.score + 1 };

        jest.spyOn(recommendationRepository, "find").mockResolvedValueOnce(recommendation);

        jest.spyOn(recommendationRepository, "updateScore").mockResolvedValueOnce(recommendationUpdated);

        await recommendationService.upvote(recommendation.id);

        expect(recommendationRepository.updateScore).toBeCalled();
    });

    it("Should decrease score by 1", async () => {
        const recommendation = await recommendationFactory.recommendationData();
        const recommendationUpdated = { ...recommendation, score: recommendation.score - 1 };

        jest.spyOn(recommendationRepository, "find").mockResolvedValueOnce(recommendation);

        jest.spyOn(recommendationRepository, "updateScore").mockResolvedValueOnce(recommendationUpdated);

        jest.spyOn(recommendationRepository, "remove").mockImplementationOnce((): any => { });

        await recommendationService.downvote(recommendation.id);

        expect(recommendationRepository.updateScore).toBeCalled();

        expect(recommendationRepository.remove).not.toBeCalled();
    });

    it("Should decrease score by 1 and delete recommendation", async () => {
        const recommendation = await recommendationFactory.recommendationData();

        recommendation.score = -5;

        const recommendationUpdated = { ...recommendation, score: recommendation.score - 1 };

        jest.spyOn(recommendationRepository, "find").mockResolvedValueOnce(recommendation);

        jest.spyOn(recommendationRepository, "updateScore").mockResolvedValueOnce(recommendationUpdated);

        jest.spyOn(recommendationRepository, "remove").mockImplementationOnce((): any => { });

        await recommendationService.downvote(recommendation.id);

        expect(recommendationRepository.updateScore).toBeCalled();

        expect(recommendationRepository.remove).toBeCalled();
    });
});

describe("Tests function 'get' of recommendationService", () => {
    it("Should return an array of recommendations", async () => {
        const recommendation = await recommendationFactory.recommendationData();

        jest.spyOn(recommendationRepository, "findAll").mockResolvedValueOnce([recommendation]);

        const result = await recommendationService.get();

        expect(result).toBeInstanceOf(Array);
        expect(result[0]).toMatchObject(recommendation);
        expect(recommendationRepository.findAll).toBeCalled();
    });
});

describe("Tests function 'getTop' of recommendationService", () => {
    it("Should return an array of recommendations", async () => {
        const recommendation = await recommendationFactory.recommendationData();
        const amount = 10;

        jest.spyOn(recommendationRepository, "getAmountByScore").mockResolvedValueOnce([recommendation]);

        const result = await recommendationService.getTop(amount);

        expect(result).toBeInstanceOf(Array);
        expect(result[0]).toMatchObject(recommendation);
        expect(recommendationRepository.getAmountByScore).toBeCalled();
    });
});

describe("Tests function 'getRandom' of recommendationService", () => {
    it("Should return a recommendation with score greater than 10", async () => {
        const min = 11;
        const max = 200;
        const recommendations = await recommendationFactory.multipleItems(min, max);
        const random = 0.6;
        const randomIndex = Math.floor(random * recommendations.length);

        jest.spyOn(global.Math, "random").mockReturnValue(random);

        jest.spyOn(recommendationRepository, "findAll").mockImplementationOnce(({ score, scoreFilter }): any => recommendations);

        const result = await recommendationService.getRandom();

        expect(result).toMatchObject(recommendations[randomIndex]);
        expect(recommendationRepository.findAll).toBeCalledTimes(1);
    });

    it("Should return a recommendation with score less than 10", async () => {
        const min = -5;
        const max = 10;
        const recommendations = await recommendationFactory.multipleItems(min, max);
        const random = 0.8;
        const randomIndex = Math.floor(random * recommendations.length);

        jest.spyOn(global.Math, "random").mockReturnValue(random);

        jest.spyOn(recommendationRepository, "findAll").mockImplementationOnce(({ score, scoreFilter }): any => recommendations);

        const result = await recommendationService.getRandom();

        expect(result).toMatchObject(recommendations[randomIndex]);
        expect(recommendationRepository.findAll).toBeCalledTimes(1);
    });

    it("Should return a recommendation with any score", async () => {
        const min = -5;
        const max = 10;
        const recommendations = await recommendationFactory.multipleItems(min, max);
        const random = 0.6;
        const randomIndex = Math.floor(random * recommendations.length);

        jest.spyOn(global.Math, "random").mockReturnValue(random);

        jest.spyOn(recommendationRepository, "findAll").mockImplementationOnce(({ score, scoreFilter }): any => []);

        jest.spyOn(recommendationRepository, "findAll").mockImplementationOnce((): any => recommendations);

        const result = await recommendationService.getRandom();

        expect(result).toMatchObject(recommendations[randomIndex]);
        expect(recommendationRepository.findAll).toBeCalledTimes(2);
    });

    it("Should response with 404 error when there is not a recommendation", async () => {
        jest.spyOn(recommendationRepository, "findAll").mockImplementationOnce(({ score, scoreFilter }): any => []);

        jest.spyOn(recommendationRepository, "findAll").mockImplementationOnce((): any => []);

        const result = recommendationService.getRandom();

        await expect(result).rejects.toEqual(notFoundError());
        expect(recommendationRepository.findAll).toBeCalledTimes(2);
    });
});