vi.mock("../io/file-manager.js", () => ({
	loadTopicNames: vi.fn(),
}))

vi.mock("./runner.js", () => ({
	runQuestionSet: vi.fn(),
}))

vi.mock("./generator.js", () => ({
	requestTopicChoice: vi.fn(),
	loadQuestionSet: vi.fn(),
	handleCustomTopic: vi.fn(),
	selectRandomQuestions: vi.fn(),
	askQuestionCount: vi.fn(),
	findExistingTopic: vi.fn(),
}))

vi.mock("../cli.js", () => ({
	promptUser: vi.fn(),
	closeReadLine: vi.fn(),
}))

import engine from "./engine.js"
import { handleCustomTopic, findExistingTopic } from "./generator.js"

afterEach(() => {
	vi.restoreAllMocks()
})

describe("engine.js", () => {
	describe("start()", () => {
		it("initialise with empty sessions array and calls prepareQuizRound", async () => {
			const prepareQuizRoundSpy = vi
				.spyOn(engine, "prepareQuizRound")
				.mockResolvedValue()

			await engine.start()

			expect(prepareQuizRoundSpy).toHaveBeenCalledTimes(1)
		})
	})

	describe("fetchQuestionSet()", () => {
		it.only("new topic that doesn't exist results in handleCustomTopic() being called & questionSet returned", async () => {
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
				desc: "Basic English-language questions about bears facts.",
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
		it("", () => {})
	})
})
