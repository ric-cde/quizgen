import {
	loadQuestionSet,
	findExistingTopic,
	selectRandomQuestions,
	addQuestionsMetadata,
	updateQuestionSet,
} from "./generator.js"

vi.mock("../io/file-manager.js", () => ({
	loadQuestionSetFromFile: vi.fn(),
	writeQuestionSetToFile: vi.fn(),
}))

import {
	loadQuestionSetFromFile,
	writeQuestionSetToFile,
} from "../io/file-manager.js"

afterEach(() => {
	vi.restoreAllMocks()
})

describe("generator.js", () => {
	describe("loadQuestionSet()", () => {
		it("empty slug throws error", async () => {
			await expect(loadQuestionSet("")).rejects.toThrow(
				"Topic slug must be a non-empty string"
			)
		})

		it("questionSet is loaded given valid slug and mocked file io", async () => {
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

			loadQuestionSetFromFile.mockResolvedValue(questionSet)

			const loadedQuestionSet = await loadQuestionSet("sample-slug")
			expect(loadedQuestionSet).toMatchObject(questionSet)
		})

		it("missing slug and title in loaded questionSet throws error", async () => {
			const questionSet = {
				desc: "Basic English-language questions about bear facts.",
				questions: [
					{
						prompt: "Are bears [mammals] or [fish]?",
						answers: ["mammals", "mammal"],
					},
				],
			}

			loadQuestionSetFromFile.mockResolvedValue(questionSet)

			await expect(loadQuestionSet("sample-slug")).rejects.toThrow(
				"Question set missing both slug and topic title"
			)
		})

		it("questionSet with no questions prints error and returns null", async () => {
			const questionSet = {
				topic: "bears",
				slug: "bears",
				desc: "Basic English-language questions about bear facts.",
			}

			loadQuestionSetFromFile.mockResolvedValue(questionSet)

			const loadedQuestionSet = await loadQuestionSet("sample-slug")

			expect(loadedQuestionSet).toBe(null)
		})
	})

	describe("findExistingTopic()", () => {
		const topics = [
			{ topic: "Asian Bears", slug: "asian-bears" },
			{ topic: "Birds", slug: "birds" },
			{ topic: "Domestic Cats", slug: "domestic-cats" },
		]

		it("returns matching topic name correctly", () => {
			const topicChoice = "asian bears"
			const existingTopic = findExistingTopic(topics, topicChoice)

			expect(existingTopic.topic).toBe("Asian Bears")
			expect(existingTopic.slug).toBe("asian-bears")
		})

		it("returns matching slug correctly when topic not found", () => {
			const topicChoice = "domestic  cats"
			const existingTopic = findExistingTopic(topics, topicChoice)

			expect(existingTopic.topic).toBe("Domestic Cats")
			expect(existingTopic.slug).toBe("domestic-cats")
		})

		it("returns undefined / false when topic & slug not found", () => {
			const topicChoice = "asiatic cats"
			const existingTopic = findExistingTopic(topics, topicChoice)

			expect(existingTopic).toBeUndefined()
		})
	})

	describe("selectRandomQuestions()", () => {
		const question = {
			prompt: "Are dolphins [mammals] or [fish]?",
			answers: ["mammals", "mammal"],
		}

		it("returns array of 5 when 10 provided", () => {
			const questions = Array(10).fill(question)
			const selectedQuestions = selectRandomQuestions(questions, 5)
			expect(selectedQuestions).toHaveLength(5)
		})

		it("returns array of 5 when 5 provided but 10 requested", () => {
			const questions = Array(5).fill(question)
			const selectedQuestions = selectRandomQuestions(questions, 10)
			expect(selectedQuestions).toHaveLength(5)
		})
	})

	describe("addQuestionsMetadata()", () => {
		it("correctly updates metadata of questions array object", () => {
			const newQuestionSet = {
				topic: "Bananas",
				desc: "Basic questions about bananas suitable for beginners.",
				difficulty: 1,
				questions: [
					{
						prompt: "What color are ripe bananas usually?",
						answers: ["yellow"],
					},
				],
			}
			const newQuestions = addQuestionsMetadata(newQuestionSet, 3)

			expect(newQuestions).toMatchObject([
				{
					prompt: "What color are ripe bananas usually?",
					answers: ["yellow"],
					questionTrancheId: 4,
					difficulty: 1,
					createdAt: expect.any(Date),
					attempts: [],
					id: expect.any(String),
					attemptCount: 0,
					correctCount: 0,
				},
			])
		})
	})

	describe("updateQuestionSet()", () => {
		beforeEach(() => {})
		it("updates questions with attempt and saves the modified question set", async () => {
			const questionSet = {
				id: "c57303d2-d0e5-4007-9915-81c6c4738f63",
				topic: "bears",
				slug: "bears",
				desc: "Basic English-language questions about bear facts.",
				questions: [
					{
						id: "c57303d2-d0e5-4007-9915-81c6c4738f63",
						prompt: "Are bears [mammals] or [fish]?",
						answers: ["mammals", "mammal"],
						questionTrancheId: 1,
						difficulty: "5",
						createdAt: "2025-09-15T15:13:10.120Z",
					},
				],
				attemptCount: 0,
				correctCount: 0,
			}

			const updatedQuestions = [
				{
					id: "c57303d2-d0e5-4007-9915-81c6c4738f63",
					prompt: "Are bears [mammals] or [fish]?",
					answers: ["mammals", "mammal"],
					questionTrancheId: 1,
					difficulty: "5",
					createdAt: "2025-09-15T15:13:10.120Z",
					attempts: [
						{
							userAnswer: "polar",
							isCorrect: true,
							answeredAt: "2025-09-15T15:13:15.075Z",
							id: "94b5ce5b-e30e-40b6-af01-ebd089b3cac4",
							answersAtTime: ["polar bear", "polar"],
						},
					],
				},
			]

			loadQuestionSetFromFile.mockResolvedValue(questionSet)

			await updateQuestionSet("bears", updatedQuestions)

			const updatedQuestionSet = writeQuestionSetToFile.mock.calls[0][1]
			expect(updatedQuestionSet.questions).toMatchObject(updatedQuestions)
		})
	})

})
