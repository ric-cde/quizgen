import { loadTopicFromFile, writeTopicToFile } from "../io/file-manager.js"
import { promptUser } from "../io/cli.js"
import { generateQuestionSet } from "../services/llm-service.js"
import {
	ERROR_MESSAGES,
	SUCCESS_MESSAGES,
	PROMPTS,
	QUIZ_DEFAULTS,
} from "../utils/constants.js"

export async function requestTopicChoice(topics) {
	const userTopic = await promptUser(PROMPTS.TOPIC_SELECTION)

	if (userTopic === "custom" || topics.includes(userTopic)) {
		return userTopic
	} else {
		console.log(ERROR_MESSAGES.TOPIC_NOT_FOUND)
		return await requestTopicChoice(topics)
	}
}

export async function loadQuestionSet(topic) {
	if (!topic || typeof topic !== "string") {
		throw new Error("Topic must be a non-empty string")
	}
	try {
		const questionSet = await loadTopicFromFile(topic)

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
	questions = questions
		.sort(() => Math.random() - 0.5)
		.slice(0, numberOfQuestions)

	return questions
}

export async function generateCustomTopic(topics, customTopic) {
	const topicAlreadyExists = topics.includes(customTopic.toLowerCase())
	let lastQuestionSetId = -1
	let questionSet = {}

	// Does the topic already exist? Ask user if they want extra questions
	if (topicAlreadyExists) {
		questionSet = { ...(await loadQuestionSet(customTopic)) }
		const existingQuestions = questionSet.questions || []

		lastQuestionSetId =
			existingQuestions.length > 0
				? existingQuestions[existingQuestions.length - 1]
						.questionSetId || 0
				: 0
	}

	if (!customTopic) {
		console.log(ERROR_MESSAGES.INVALID_TOPIC_NAME)
		return null
	}
	const numberOfQuestions = await askQuestionCount(10)
	const difficulty = await promptUser(PROMPTS.QUESTION_DIFFICULTY)

	try {
		console.log(
			`Generating new question set about: ${customTopic} (questions: ${numberOfQuestions}, difficulty: ${difficulty})`
		)

		const newQuestionSet = await generateQuestionSet(
			customTopic,
			numberOfQuestions,
			difficulty
		)

		const newQuestions = newQuestionSet.questions.map((question) => {
			question.questionSetId = lastQuestionSetId + 1
			question.difficulty = newQuestionSet.difficulty
			question.createdAt = new Date()
			return question
		})

		newQuestionSet.questions = newQuestions

		const existingQuestions = questionSet.questions || []

		const mergedQuestionSet = {
			topic: questionSet.topic || newQuestionSet.topic,
			desc: questionSet.desc || newQuestionSet.desc,
			questions: [...existingQuestions, ...newQuestions],
		}

		// save merged version of existing and new question sets
		await saveTopic(customTopic, mergedQuestionSet)

		if (!topicAlreadyExists) {
			topics.push(customTopic)
		}
		console.log(SUCCESS_MESSAGES.TOPIC_ADDED(customTopic))

		// return only the new question set for this round
		return newQuestionSet
	} catch (err) {
		console.log("Error:", err)
		return null
	}
}

async function saveTopic(customTopic, questionSet) {
	await writeTopicToFile(customTopic, questionSet)
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
