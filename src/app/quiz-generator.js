import { loadTopicFromFile, writeTopicToFile } from "../io/file-manager.js"
import { promptUser } from "../io/cli.js"
import {
	ERROR_MESSAGES,
	SUCCESS_MESSAGES,
	PROMPTS,
	CUSTOM_TOPIC_TEMPLATE,
	QUIZ_DEFAULTS,
} from "../utils/constants.js"

export async function requestTopic(topics) {
	const userTopic = await promptUser(PROMPTS.TOPIC_SELECTION)
	if (userTopic === "custom") {
		return generateCustomTopic(topics)
	} else if (topics.includes(userTopic)) {
		return userTopic
	} else {
		console.log(ERROR_MESSAGES.TOPIC_NOT_FOUND)
		return await requestTopic(topics)
	}
}

export async function loadQuestions(topic) {
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

export async function selectRandomQuestions(questions) {
	const numberOfQuestions = await askQuestionCount(questions)

	questions = questions
		.sort(() => Math.random() - 0.5)
		.slice(0, numberOfQuestions)

	return questions
}

export async function generateCustomTopic(topics) {
	const customTopic = await promptUser(PROMPTS.CUSTOM_TOPIC)
	if (!customTopic) {
		console.log(ERROR_MESSAGES.INVALID_TOPIC_NAME)
		return await generateCustomTopic(topics)
	}
	if (!topics.includes(customTopic)) {
		const questionSet = {
			topic: customTopic,
			...CUSTOM_TOPIC_TEMPLATE,
		}

		try {
			await saveTopic(customTopic, questionSet)
			topics.push(customTopic)
			console.log(SUCCESS_MESSAGES.TOPIC_ADDED(customTopic))
			return customTopic
		} catch (err) {
			console.log("Error:", err)
			return await generateCustomTopic(topics)
		}
	} else {
		console.log(ERROR_MESSAGES.TOPIC_EXISTS)
		return await generateCustomTopic(topics)
	}
}

async function saveTopic(customTopic, questionSet) {
	await writeTopicToFile(customTopic, questionSet)
}

async function askQuestionCount(questions) {
	const count = await promptUser(PROMPTS.QUESTION_COUNT(questions.length))
	const numCount = parseInt(count.trim())

	if (
		!isNaN(numCount) &&
		numCount <= questions.length &&
		numCount >= QUIZ_DEFAULTS.MIN_QUESTIONS
	) {
		return numCount
	} else {
		console.log(
			`Error: must choose a value between ${QUIZ_DEFAULTS.MIN_QUESTIONS} and ${questions.length}`
		)
		return await askQuestionCount(questions)
	}
}
