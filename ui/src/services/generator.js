export const generateQuestionSet = async ({
	title,
	description = "",
	difficulty,
	grade = "",
	count,
	extend = false,
	questions = [],
}) => {
	if (!title) throw new Error("title is required")
	if (count === undefined) throw new Error("question `count` is required")
	if (!difficulty) throw new Error("difficulty is required")
	if (extend === true && (!questions || questions.length === 0)) {
		throw new Error("extend set to true but no questions provided")
	}

	const questionSet = {
		title,
		description,
		difficulty,
		grade,
		questions,
	}
	const config = { count, extend }

	const newQuestionSet = mockGeneration(questionSet, config)
	// const newQuestionSet = localGenerateQuestionSet(questionSet, config)
	// const newQuestionSet = {}

	return newQuestionSet
}

const mockGeneration = (questionSet, config) => {
	const { difficulty } = questionSet
	const mockData = {
		title: "Bears",
		description:
			"Intermediate-level questions about various bear species, their characteristics, and behaviors.",
		questions: [
			{
				prompt: "Which bear species is primarily known for its distinctive white fur?",
				answers: ["polar bear", "polar"],
				difficulty,
			},
			{
				prompt: "What is the main diet of a giant panda?",
				answers: ["bamboo", "bamboo shoots"],
				difficulty,
			},
			{
				prompt: "Are bears carnivores, herbivores, or omnivores?",
				answers: ["omnivores", "omnivore"],
				difficulty,
			},
		],
	}

	return { ...mockData, questions: mockData.questions.slice(0, config.count) }
}

export default { generateQuestionSet }
