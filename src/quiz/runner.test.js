import {
	checkAnswer,
	createQuizSession,
	generateNextSessionId,
	loopThroughQuestions,
} from "./runner.js"

import { promptUser } from "../io/cli.js"
vi.mock("../io/cli.js", () => ({
	promptUser: vi.fn(),
}))

afterEach(() => {
	vi.restoreAllMocks()
})

describe("runner.js", () => {
	describe("checkAnswer()", () => {
		const question = {
			prompt: "Which bear species is primarily known for its distinctive white fur?",
			answers: ["polar bear", "polar"],
		}
		it("correct answer returns true", () => {
			const userAnswer = "polar bear"

			const result = checkAnswer(question, userAnswer)
			expect(result).toBe(true)
		})
		it("other correct answer returns true regardless of case", () => {
			const userAnswer = "POLAR"

			const result = checkAnswer(question, userAnswer)
			expect(result).toBe(true)
		})
		it("incorrect answer returns false", () => {
			const userAnswer = "brown"

			const result = checkAnswer(question, userAnswer)
			expect(result).toBe(false)
		})
		it("empty string answer returns false", () => {
			const userAnswer = ""

			const result = checkAnswer(question, userAnswer)
			expect(result).toBe(false)
		})
	})

	describe("createQuizSession()", () => {
		it("returns valid quizSession", () => {
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
			const quizSession = createQuizSession(questionSet, 7)
			expect(quizSession).toMatchObject({
				id: 7,
				topic: questionSet.topic,
				desc: questionSet.desc,
				questions: [...questionSet.questions],
				completed: false,
				correct: 0,
				total: questionSet.questions.length,
				score: 0,
				result: null,
				startTime: expect.any(Date),
			})
		})
	})

	describe("generateNextSessionId()", () => {
		it("returns id of last session plus one", () => {
			const quizSessions = [
				{
					id: 0,
					topic: "Bears",
				},
				{
					id: 1,
					topic: "Cats",
				},
			]
			const nextSessionId = generateNextSessionId(quizSessions)
			expect(nextSessionId).toBe(2)
		})
		it("returns 0 when empty array provided", () => {
			const quizSessions = []
			const nextSessionId = generateNextSessionId(quizSessions)
			expect(nextSessionId).toBe(0)
		})
	})

	describe("loopThroughQuestions()", () => {
		let questions
		beforeEach(() => {
			questions = [
				{
					prompt: "Are dolphins [mammals] or [fish]?",
					answers: ["mammals", "mammal"],
				},
				{
					prompt: "Do river dolphins live in [saltwater] or [freshwater]?",
					answers: ["freshwater", "both"],
				},
				{
					prompt: "How many fins does a typical dolphin have?",
					answers: ["three", "3"],
				},
			]
		})
		it("given an array of questions and mocked correct answers, adds stats to questions array correctly", async () => {
			promptUser.mockResolvedValueOnce(questions[0].answers[0])
			promptUser.mockResolvedValueOnce(questions[1].answers[1])
			promptUser.mockResolvedValueOnce(questions[2].answers[1])

			await loopThroughQuestions(questions)

			expect(promptUser).toHaveBeenCalledTimes(3)

			questions.forEach((question) => {
				expect(question.attemptCount).toBe(1)
				expect(question.correctCount).toBe(1)
				expect(question.attempts[0].isCorrect).toBe(true)
			})
		})

		it("given an array of questions and mocked wrong answers, adds stats to questions array correctly", async () => {
			promptUser.mockResolvedValueOnce("fish")
			promptUser.mockResolvedValueOnce("saltwater")
			promptUser.mockResolvedValueOnce("2")

			await loopThroughQuestions(questions)

			expect(promptUser).toHaveBeenCalledTimes(3)

			questions.forEach((question) => {
				expect(question.attemptCount).toBe(1)
				expect(question.correctCount).toBe(0)
				expect(question.attempts[0].isCorrect).toBe(false)
			})
		})
	})
})
