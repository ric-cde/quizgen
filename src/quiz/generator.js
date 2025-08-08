import {
	loadQuestionSetFromFile as loadQuestionSetFromFile,
	writeQuestionSetToFile,
} from "../io/file-manager.js"
import { promptUser } from "../io/cli.js"
import { generateQuestionSet } from "../services/llm-service.js"
import {
	ERROR_MESSAGES,
	SUCCESS_MESSAGES,
	PROMPTS,
	QUIZ_DEFAULTS,
} from "../utils/constants.js"
import { randomUUID } from "node:crypto"
import { slugify } from "../utils/helpers.js"

export async function requestTopicChoice(topics) {
	const userTopic = await promptUser(PROMPTS.TOPIC_SELECTION)

	if (userTopic === "custom" || findExistingTopic(topics, userTopic)) {
		return userTopic
	} else {
		console.log(ERROR_MESSAGES.TOPIC_NOT_FOUND)
		return await requestTopicChoice(topics)
	}
}

export async function loadQuestionSet(slug) {
	if (!slug || typeof slug !== "string") {
		throw new Error("Topic slug must be a non-empty string")
	}
	try {
		const questionSet = await loadQuestionSetFromFile(slug)

		if (!questionSet.slug || questionSet.slug === "") {
			if (questionSet.topic) {
				questionSet.slug = slugify(questionSet.topic)
			} else {
				throw new Error(
					"Question set missing both slug and topic title"
				)
			}
		}

		if (
			!questionSet.questions ||
			!Array.isArray(questionSet.questions) ||
			questionSet.questions.length < 1
		) {
			console.log(ERROR_MESSAGES.NO_QUESTIONS)
			return null
		}

		return questionSet
	} catch (err) {
		console.error("Error:", err)
		return null
	}
}

export function selectRandomQuestions(questions, numberOfQuestions = 5) {
	const shuffled = [...questions]
		.sort(() => Math.random() - 0.5)
		.slice(0, numberOfQuestions)

	return shuffled
}

export async function handleCustomTopic(topics, topicChoice) {
	if (!topicChoice) {
		console.log(ERROR_MESSAGES.INVALID_TOPIC_NAME)
		return null
	}

	const existingTopic = findExistingTopic(topics, topicChoice)
	const topicAlreadyExists = !!existingTopic

	let questionSet = {}

	// check if topic exists
	if (topicAlreadyExists) {
		const slug = existingTopic.slug || slugify(topicChoice)
		questionSet = await loadQuestionSet(slug)
		if (!questionSet) {
			console.log("Error loading existing topic. Creating new one...")
		}
	}

	const numberOfQuestions = await askQuestionCount(10)
	const difficulty = await promptUser(PROMPTS.QUESTION_DIFFICULTY)

	try {
		console.log(
			`Generating new question set about: ${topicChoice} (questions: ${numberOfQuestions}, difficulty: ${difficulty})`
		)

		const { mergedQuestionSet, lastQuestionTrancheId } =
			await generateAndMergeQuestions(
				topicChoice,
				numberOfQuestions,
				difficulty,
				questionSet
			)

		await saveQuestionSet(mergedQuestionSet)
		console.log(SUCCESS_MESSAGES.TOPIC_ADDED(topicChoice))

		const newQuestions = mergedQuestionSet.questions.filter(
			(q) => q.questionTrancheId === lastQuestionTrancheId + 1
		)

		// return only the new question set for this round
		return {
			...mergedQuestionSet,
			questions: newQuestions,
		}
	} catch (err) {
		console.log("Error:", err)
		return null
	}
}

async function generateAndMergeQuestions(
	topicChoice,
	numberOfQuestions,
	difficulty,
	questionSet = {}
) {
	// generate new questions from the llm-service
	const newQuestionSet = await generateQuestionSet(
		topicChoice,
		numberOfQuestions,
		difficulty
	)

	const existingQuestions = questionSet.questions || []

	const lastQuestionTrancheId =
		existingQuestions.length > 0
			? Math.max(
					...(existingQuestions.map((q) => q.questionTrancheId) || 0)
			  )
			: 0

	const newQuestions = addQuestionsMetadata(
		newQuestionSet,
		lastQuestionTrancheId
	)

	const mergedQuestionSet = {
		topic: questionSet.topic || newQuestionSet.topic,
		slug: questionSet.slug || slugify(newQuestionSet.topic),
		desc: questionSet.desc || newQuestionSet.desc,
		id: questionSet.id || randomUUID(),
		questions: [...existingQuestions, ...newQuestions],
	}

	return { mergedQuestionSet, lastQuestionTrancheId }
}

export function findExistingTopic(topics, topicChoice) {
	return topics.find(
		(t) =>
			t.topic.toLowerCase() === topicChoice.toLowerCase() ||
			t.slug === slugify(topicChoice)
	)
}

async function saveQuestionSet(questionSet) {
	const slug = questionSet.slug || slugify(questionSet.topic)
	await writeQuestionSetToFile(slug, questionSet)
}

export async function updateQuestionSet(
	slug,
	updatedQuestions,
	topicName = null
) {
	const questionSet = await loadQuestionSet(slug)

	// update metadata of only the questions asked in current round
	const questionSetMap = new Map()
	for (const q of questionSet.questions) {
		questionSetMap.set(q.id, q)
	}

	for (const q of updatedQuestions) {
		questionSetMap.set(q.id, q)
	}

	if (topicName && topicName !== "") {
		questionSet.topic = topicName
	}

	questionSet.questions = [...questionSetMap.values()]

	try {
		await saveQuestionSet(questionSet)
		console.log("Answers saved to disk.")
	} catch (err) {
		console.error("Error saving question set:", err)
	}
}

function addQuestionsMetadata(
	{ questions, difficulty },
	lastQuestionTrancheId
) {
	return questions.map((question) => {
		question.questionTrancheId = lastQuestionTrancheId + 1
		question.difficulty = difficulty
		question.createdAt = new Date()
		question.attempts = []
		question.id = randomUUID()
		question.attemptCount = 0
		question.correctCount = 0
		return question
	})
}

export async function askQuestionCount(max, min = QUIZ_DEFAULTS.MIN_QUESTIONS) {
	const count = await promptUser(PROMPTS.QUESTION_COUNT(max))
	const numCount = parseInt(count.trim())

	if (!isNaN(numCount) && numCount <= max && numCount >= min) {
		return numCount
	} else {
		console.log(`Error: must choose a value between ${min} and ${max}`)
		return await askQuestionCount(max)
	}
}
