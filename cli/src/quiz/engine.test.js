

vi.mock("./generator.js", () => ({
	handleCustomTopic: vi.fn(),
	findExistingTopic: vi.fn(),
}))

import { SUCCESS_MESSAGES } from "../utils/constants.js"
import { ERROR_MESSAGES } from "../utils/constants.js"

import engine from "./engine.js"
import { handleCustomTopic, findExistingTopic } from "./generator.js"

afterEach(() => {
	vi.restoreAllMocks()
})

describe("engine.js", () => {
	describe("start()", () => {
		let consoleSpy, prepareQuizRoundSpy

		beforeEach(() => {
			consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {})
			vi.spyOn(console, "error").mockImplementation(() => {})
			prepareQuizRoundSpy = vi.spyOn(engine, "prepareQuizRound")
		})

		it("initialise with empty sessions array and calls prepareQuizRound", async () => {
			prepareQuizRoundSpy.mockReturnValue(true)

			await engine.start([])
			expect(consoleSpy).toHaveBeenCalledWith(SUCCESS_MESSAGES.WELCOME)
			expect(prepareQuizRoundSpy).toHaveBeenCalledTimes(1)
		})

		it("throws an error when topics don't load", async () => {
			const exitSpy = vi
				.spyOn(process, "exit")
				.mockImplementation(() => {})

			prepareQuizRoundSpy.mockImplementation(() => {
				throw new Error("Test error")
			})

			await engine.start([])

			expect(consoleSpy).toHaveBeenCalledWith(
				ERROR_MESSAGES.LOAD_TOPICS_FAILED
			)
			expect(prepareQuizRoundSpy).toHaveBeenCalledTimes(1)
			expect(exitSpy).toHaveBeenCalledWith(0)
		})
	})

	describe("fetchQuestionSet()", () => {
		it("new topic that doesn't exist results in handleCustomTopic() being called & questionSet returned", async () => {
			const topicChoice = "BEARS"
			const topics = [
				{
					topic: "dolphins",
					slug: "dolphins",
				},
				{
					topic: "19th Century French History",
					slug: "19th-century-french-history",
				},
			]
			const questionSet = {
				topic: "bears",
				slug: "bears",
				desc: "Basic English-language questions about bear facts.",
				questions: [
					{
						prompt: "Are bears [mammals] or [fish]?",
						answers: ["mammals", "mammal"],
					},
				],
			}

			findExistingTopic.mockReturnValue(null)

			handleCustomTopic.mockResolvedValue(questionSet)

			const returnQuestionSet = await engine.fetchQuestionSet(
				topics,
				topicChoice
			)

			expect(findExistingTopic).toHaveBeenCalledWith(topics, topicChoice)
			expect(handleCustomTopic).toHaveBeenCalledWith(topics, topicChoice)
			expect(returnQuestionSet).toEqual(questionSet)
		})
	})

	describe("exitQuizgen()", () => {
		let consoleSpy

		beforeEach(() => {
			consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {})
		})

		it("exit results for two quizzes displayed correctly", () => {
			const quizSessions = [
				{
					id: 0,
					topic: "Bears",
					desc: "Intermediate-level questions about various bear species, their characteristics, and behaviors.",
					completed: true,
					correct: 1,
					total: 3,
					score: 33.33,
					result: "1 out of 3 (33.33%)",
					startTime: new Date("2025-09-15T15:13:11.666Z"),
				},
				{
					id: 1,
					topic: "Cats",
					desc: "Intermediate-level questions about cats.",
					completed: true,
					correct: 2,
					total: 3,
					score: 66.66,
					result: "2 out of 3 (66.66%)",
					startTime: new Date("2025-09-15T15:15:11.666Z"),
				},
			]

			engine.exitQuizgen(quizSessions)

			expect(consoleSpy.mock.calls[0].join(" ")).toContain(
				"You did 2 quizzes"
			)
			const secondLog = consoleSpy.mock.calls[1].join(" ")
			expect(secondLog).toContain("Bears: 1 out of 3 (33.33%).")
			expect(secondLog).toContain("Cats: 2 out of 3 (66.66%).")

			expect(consoleSpy.mock.calls[2].join(" ")).toContain(
				"Overall, you answered 3 out of 6 correctly (50%)"
			)
			expect(consoleSpy.mock.calls[3].join(" ")).toContain(
				"See you next time. Exiting..."
			)
		})
	})
})
