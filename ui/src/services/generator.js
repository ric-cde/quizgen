const mockGeneration = (questionSet, config) => {
	return {}
}

const generateQuestionSet = async ({
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
	if (!questions || questions.length === 0) {
		extend = false
	}

	const questionSet = {
		title,
		description,
		difficulty,
		grade,
		count,
		questions,
	}
	const config = { extend }

	return mockGeneration(questionSet, config)
}

export default { generateNew }
