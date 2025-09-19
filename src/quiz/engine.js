import { runQuestionSet } from "./runner.js"
import {
	requestTopicChoice,
	loadQuestionSet,
	handleCustomTopic,
	selectRandomQuestions,
	askQuestionCount,
	findExistingTopic,
} from "./generator.js"
import { promptUser, closeReadLine } from "../io/cli.js"
import { loadTopicNames } from "../io/file-manager.js"
import { getAllQuizScores, getOverallCorrect } from "./scoring.js"
import { countdown } from "../utils/helpers.js"
import {
	PROMPTS,
	SUCCESS_MESSAGES,
	ERROR_MESSAGES,
	COUNTDOWN_CONFIG,
	QUIZ_DEFAULTS,
} from "../utils/constants.js"

let quizSessions = []

export async function start(initialSessions = null) {
	if (initialSessions !== null) {
		quizSessions = initialSessions // For testing
	} else {
		quizSessions = [] // Normal operation
	}

	try {
		console.log(SUCCESS_MESSAGES.WELCOME)
		await engine.prepareQuizRound()
	} catch (err) {
		console.error(err)
		console.log(ERROR_MESSAGES.LOAD_TOPICS_FAILED)
		process.exit(0)
	}
}

export async function prepareQuizRound() {
	const topics = await loadTopicNames()
	if (topics.length > 0) {
		console.log(SUCCESS_MESSAGES.TOPICS_LOADED)
	} else {
		console.log(ERROR_MESSAGES.NO_TOPICS_AVAILABLE)
		process.exit(0)
	}

	console.log(
		`The following topics are available:\n\n${topics
			.map((t) => t.topic)
			.join("\n")}\ncustom\n`
	)

	let questionSet = await getTopicAndQuestionSet(topics)

	// console.log("questionSet is:", questionSet)
	if (!questionSet) {
		console.log(
			"Error loading questions for this topic. Please try a different topic."
		)
		await engine.prepareQuizRound()
		return
	}

	console.log(`\nGreat! Get ready to dive deep on ${questionSet.topic}.`)

	await countdown(
		async () => {
			while (true) {
				// 1 = same topic, 2 = another topic
				const replayChoice = await runQuestionSet(
					questionSet,
					quizSessions
				)

				switch (replayChoice) {
					case "1":
						console.log("Perfect, restarting the quiz...")
						questionSet = await engine.fetchQuestionSet(
							topics,
							questionSet.topic
						)
						break
					case "2":
						await engine.prepareQuizRound()
						return
					default:
						// exit logic
						closeReadLine()
						engine.exitQuizgen(quizSessions)
						return
				}
			}
		},
		QUIZ_DEFAULTS.COUNTDOWN_DELAY,
		COUNTDOWN_CONFIG.MESSAGE,
		COUNTDOWN_CONFIG.PHRASES
	)
}

async function getTopicAndQuestionSet(topics) {
	// asks user for topic choice, then fetches questionSet
	let topicChoice = await requestTopicChoice(topics)

	if (topicChoice === "custom") {
		// fetch user custom topic here
		topicChoice = await promptUser(PROMPTS.CUSTOM_TOPIC)
	}

	const questionSet = await engine.fetchQuestionSet(topics, topicChoice)
	return questionSet
}

async function fetchQuestionSet(topics, topicChoice) {
	const topicAlreadyExists = !!findExistingTopic(topics, topicChoice)
	// console.log(
	// 	`Inside fetchQuestionSet. topics = ${JSON.stringify(
	// 		topics,
	// 		null,
	// 		2
	// 	)}\n topicChoice = ${topicChoice}`
	// )

	let questionSet
	let generateNew = !topicAlreadyExists

	if (topicAlreadyExists) {
		// ask user if they want new or existing questions
		const newOrExistingChoice = await promptUser(PROMPTS.TOPIC_EXISTS)
		if (newOrExistingChoice === "new") {
			generateNew = true
		}
	}
	// console.log(`generateNew = ${generateNew}`)
	if (generateNew) {
		questionSet = await handleCustomTopic(topics, topicChoice)
	} else if (topicAlreadyExists) {
		const existingTopic = findExistingTopic(topics, topicChoice)

		// console.log(`existingTopic = ${JSON.stringify(existingTopic)}`)

		const fullQuestionSet = await loadQuestionSet(existingTopic.slug)
		const numberOfQuestions = await askQuestionCount(
			fullQuestionSet.questions.length
		)

		questionSet = {
			...fullQuestionSet,
			questions: selectRandomQuestions(
				fullQuestionSet.questions,
				numberOfQuestions
			),
		}
	}
	return questionSet
}

export function exitQuizgen(quizSessions) {
	const count = quizSessions.length
	if (count > 0) {
		console.log(
			`\nYou did ${count} quiz${
				count === 1 ? "" : "zes"
			}. Your result(s):\n`
		)

		console.log(getAllQuizScores(quizSessions).join("\n") + "\n")

		console.log(getOverallCorrect(quizSessions))
	}
	console.log("See you next time. Exiting...")
}

const engine = {
	start,
	prepareQuizRound,
	exitQuizgen,
	fetchQuestionSet,
}

export default engine
