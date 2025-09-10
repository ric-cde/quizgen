const { mockCreate } = vi.hoisted(() => {
	return { mockCreate: vi.fn() }
})

vi.mock("openai", () => {
	const MockOpenAI = vi.fn().mockImplementation(() => ({
		responses: {
			create: mockCreate,
		},
	}))
	return { default: MockOpenAI }
})

import { generateQuestionSet, buildPrompt } from "./llm-service"

beforeEach(() => {
	vi.clearAllMocks()
})
afterEach(() => {
	vi.restoreAllMocks()
})

describe("buildPrompt", () => {
	it("given a topic, count, and difficulty, format these in single prompt", () => {
		const prompt = buildPrompt("Dolphin facts", 4, "intermediate")
		expect(prompt).toMatch(/<topic>Dolphin facts<\/topic>/)
		expect(prompt).toMatch(/<question_count>4<\/question_count>/)
		expect(prompt).toMatch(/<difficulty>intermediate<\/difficulty>/)
		console.log(prompt)
	})
})

describe("generateQuestionSet", () => {
	it("given topic, calls mocked LLM and returns dummy questionSet with correct topic", async () => {
		const mockApiResponse = {
			output_text: `{
			"topic": "Dolphin facts",
			"desc": "Basic English-language questions about dolphin facts.",
			"questions": [
				{
					"prompt": "What is the name of the hole dolphins use to breathe?",
					"answers": ["blowhole", "blow hole", "spiracle"]
				},
				{
					"prompt": "Are dolphins [mammals], [birds], or [fish]?",
					"answers": ["mammals", "mammal"]
				},
				{
					"prompt": "How many fins does a dolphin have?",
					"answers": ["three", "3"]
				},
				{
					"prompt": "What taxonomic group do ocean dolphins belong to?",
					"answers": ["odontocetes", "odontoceti", "delphinidae", "cetacea", "cetacean", "cetaceans"]
				}
			],
			"difficulty": "2"
		}`,
			usage: {
				input_tokens: 100,
				output_tokens: 100,
			},
		}

		mockCreate.mockResolvedValue(mockApiResponse)

		const questionSet = await generateQuestionSet("Dolphin Facts", 4)
		expect(mockCreate).toHaveBeenCalledTimes(1)
		expect(questionSet.topic).toBe("Dolphin facts")
		expect(questionSet.questions).toHaveLength(4)
		expect(questionSet.questions[0].prompt).toBe(
			"What is the name of the hole dolphins use to breathe?"
		)
	})

	it("should throw an error if API call fails", async () => {
		const apiError = new Error("API Error")
		mockCreate.mockRejectedValue(apiError)

		await expect(generateQuestionSet("tiger facts", 1)).rejects.toThrow(
			"API Error"
		)
	})

	describe("real API call to Open API", () => {
		beforeAll(() => {
			// remove mock for this test block
			vi.doUnmock("openai")
			vi.resetModules()
		})

		it("returns valid JSON", {timeout: 20000}, 	async () => {
			// re-import openai skipped due to initial mock
			const { generateQuestionSet: realGenerateQuestionSet } =
				await import("./llm-service")

			const questionSet = await realGenerateQuestionSet(
				"Dolphin Facts",
				2
			)

			console.log(questionSet)
			expect(questionSet).toHaveProperty("topic")
			expect(questionSet).toHaveProperty("questions")
			expect(questionSet.topic).toMatch(/dolphin/i)
			expect(questionSet.questions).toHaveLength(2)
		})
	})
})
