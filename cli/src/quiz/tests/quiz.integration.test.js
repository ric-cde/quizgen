import engine from "../engine.js"

vi.mock("../../io/file-manager.js", () => ({
	loadTopicNames: vi.fn(),
	loadQuestionSetFromFile: vi.fn(),
	writeQuestionSetToFile: vi.fn(),
}))

vi.mock("../../io/cli.js", () => ({
	promptUser: vi.fn(),
	closeReadLine: vi.fn(),
}))

vi.mock("../../services/llm-service.js", () => ({
	generateQuestionSet: vi.fn(),
}))

vi.mock("../../utils/constants.js", async (importOriginal) => {
	const actual = await importOriginal()
	return {
		...actual,
		COUNTDOWN_DELAY: 0,
	}
})

import {
	loadTopicNames,
	loadQuestionSetFromFile,
	writeQuestionSetToFile,
} from "../../io/file-manager.js"

import { generateQuestionSet } from "../../services/llm-service.js"
import { closeReadLine, promptUser } from "../../io/cli.js"
import { sanitiseInput } from "../../utils/helpers.js"
import { describe } from "vitest"

const setupUserPrompts = (answers) => {
	answers.forEach((answer) => {
		promptUser.mockImplementationOnce(() => {
			// console.log(answer)
			return sanitiseInput(String(answer))
		})
	})
}

let logSpy

beforeEach(() => {
	logSpy = vi.spyOn(console, "log")

	loadTopicNames.mockReturnValue([
		{
			topic: "Bananas",
			slug: "bananas",
		},
		{
			topic: "Dogaroos",
			slug: "dogaroos",
		},
	])
})

afterEach(() => {
	vi.restoreAllMocks()
})

describe("Custom topic flow", () => {
	it("user can start app, request custom topic, get valid list set of questions, score correctly calculated, exits normally", async () => {
		// ARRANGE
		const newQuestionSet = {
			topic: "Dogs",
			slug: "dogs",
			desc: "Advanced questions testing detailed knowledge about dogs, including breeds, biology, and behavior.",
			questions: [
				{
					prompt: "Which gene is primarily responsible for the coat color variation in domestic dogs?",
					answers: [
						"mc1r",
						"melanocortin 1 receptor",
						"melanocortin-1 receptor",
					],
					questionSetId: 0,
				},
				{
					prompt: "Species name for dogs?",
					answers: ["canine"],
					questionSetId: 0,
				},
				{
					prompt: "What sound do dogs make?",
					answers: ["bark"],
					questionSetId: 0,
				},
			],
		}

		const questionCount = "3"
		const difficulty = "intermediate"

		const userInputs = [
			"custom", // menu choice
			"  dogs  ", // topic choice
			questionCount, // question count
			difficulty, // difficulty
			newQuestionSet.questions[0].answers[0], // first answer
			newQuestionSet.questions[1].answers[0], // second answer
			newQuestionSet.questions[2].answers[0], // third answer
			"exit", // replay choice
		]

		setupUserPrompts(userInputs)

		loadQuestionSetFromFile.mockImplementation((slug) => {
			if (slug === "dogs") {
				return newQuestionSet
			}
		})

		generateQuestionSet.mockResolvedValueOnce(newQuestionSet)
		writeQuestionSetToFile.mockImplementation(() => {})

		// ACT
		await engine.start()

		// ASSERT

		expect(generateQuestionSet).toHaveBeenCalledWith(
			newQuestionSet.slug,
			Number(questionCount),
			difficulty
		)

		// check question was saved both before and after quiz
		expect(writeQuestionSetToFile).toHaveBeenCalledTimes(2)

		expect(writeQuestionSetToFile).toHaveBeenLastCalledWith(
			"dogs",
			expect.objectContaining({
				slug: "dogs",
				topic: "Dogs",
				questions: expect.arrayContaining([
					expect.objectContaining({
						attemptCount: 1,
						attempts: expect.arrayContaining([
							expect.objectContaining({ isCorrect: true }),
						]),
					}),
				]),
			})
		)

		expect(logSpy).toHaveBeenCalledWith("You scored: 3 out of 3 (100%)!")
		expect(logSpy).toHaveBeenCalledWith(
			expect.stringContaining("Dogs: 3 out of 3 (100%)")
		)
		expect(logSpy).toHaveBeenCalledWith(
			expect.stringContaining(
				"Overall, you answered 3 out of 3 correctly (100%)"
			)
		)

		expect(closeReadLine).toHaveBeenCalledOnce()
	})
})

describe("Existing topic flow", () => {
	it("user can load existing topic, do round with existing questions, then do second round with newly generated questions, saves correctly", async () => {
		// ARRANGE
		const questionSet = {
			topic: "Dogaroos",
			slug: "dogaroos",
			desc: "Easy questions testing knowledge about dogaroos.",
			questions: [
				{
					prompt: "What two animals are combined to form a dogaroo?",
					answers: ["dog and kangaroo", "kangaroo and dog"],
					questionTrancheId: 1,
					difficulty: 5,
					createdAt: "2025-09-19T08:34:01.517Z",
					attempts: [
						{
							userAnswer: "dog and kangaroo",
							isCorrect: true,
							answeredAt: "2025-09-19T08:34:10.623Z",
							id: "a6bb72d7-5361-43c3-94ab-9478900c87f1",
							answersAtTime: [
								"dog and kangaroo",
								"kangaroo and dog",
							],
						},
					],
					id: "a0d1a86a-d1a5-4561-bd73-f83d8e8bf71f",
					attemptCount: 1,
					correctCount: 1,
				},
			],
		}

		const newQuestionSet = {
			topic: "Dogaroos",
			slug: "dogaroos",
			desc: "Easy questions testing knowledge about dogaroos.",
			questions: [
				{
					prompt: "Do dogaroos typically inherit the hopping ability of kangaroos?",
					answers: ["yes", "yep", "correct", "yeah"],
				},
			],
		}

		const questionCount = "1"
		const difficulty = "hard"

		const userInputs = [
			"dogaroos", // topic choice
			"existing", // generation choice
			questionCount, // question count
			questionSet.questions[0].answers[0], // first answer
			"1", // replay choice
			"new", //
			questionCount, // new question count
			difficulty, // new difficulty
			"wrong answer", // first answer (round 2)
			"exit", // replace choice two
		]

		setupUserPrompts(userInputs)

		loadQuestionSetFromFile.mockImplementation((slug) => {
			if (slug === "dogaroos") {
				return questionSet
			}
		})

		generateQuestionSet.mockResolvedValueOnce(newQuestionSet)
		writeQuestionSetToFile.mockImplementation(() => {})

		// ACT
		await engine.start()

		// ASSERT

		expect(generateQuestionSet).toHaveBeenCalledWith(
			questionSet.topic,
			Number(questionCount),
			difficulty
		)

		// check question was saved both before and after quiz
		expect(writeQuestionSetToFile).toHaveBeenCalledTimes(3)

		expect(writeQuestionSetToFile).toHaveBeenLastCalledWith(
			"dogaroos",
			expect.objectContaining({
				slug: "dogaroos",
				topic: "Dogaroos",
				questions: expect.arrayContaining([
					expect.objectContaining({
						attemptCount: 1,
						attempts: expect.arrayContaining([
							expect.objectContaining({ isCorrect: false }),
						]),
					}),
				]),
			})
		)

		expect(logSpy).toHaveBeenCalledWith("You scored: 1 out of 1 (100%)!")
		expect(logSpy).toHaveBeenCalledWith(
			expect.stringContaining("Dogaroos: 0 out of 1 (0%)")
		)
		expect(logSpy).toHaveBeenCalledWith(
			expect.stringContaining(
				"Overall, you answered 1 out of 2 correctly (50%)"
			)
		)

		expect(closeReadLine).toHaveBeenCalledOnce()
	})
})
