import { askForReplay, runQuestionSet } from "./quiz-runner.js"
import {
	requestTopic,
	loadQuestions,
	selectRandomQuestions,
} from "./quiz-generator.js"
import { loadTopicNames } from "../io/file-manager.js"
import { getAllQuizScores, getOverallCorrect } from "./scoring.js"
import { closeReadLine } from "../io/cli.js"
import { countdown } from "../utils/helpers.js"
import {
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
		const topics = await loadTopicNames()
		if (topics.length > 0) {
			console.log(SUCCESS_MESSAGES.TOPICS_LOADED)
			console.log(SUCCESS_MESSAGES.WELCOME)
			await prepareQuizRound(topics)
		} else {
			console.log(ERROR_MESSAGES.NO_TOPICS_AVAILABLE)
			process.exit(0)
		}
	} catch (err) {
		console.error(err)
		console.log(ERROR_MESSAGES.LOAD_TOPICS_FAILED)
		process.exit(0)
	}
}

export async function prepareQuizRound(topics) {
	console.log(
		`The following topics are available:\n\n${topics.join("\n")}\ncustom\n`
	)
	const topic = await requestTopic(topics)
	console.log(`\nGreat! Get ready to dive deep on ${topic}.`)

	const questionSet = await loadQuestions(topic)
	if (!questionSet) {
		console.log("Error. Restarting...")
		await prepareQuizRound(topics)
		return
	}

	questionSet.questions = await selectRandomQuestions([
		...questionSet.questions,
	])

	countdown(
		async () => {
			await runQuestionSet(questionSet, quizSessions)

			if (await askForReplay()) {
				console.log("Perfect, restarting the quiz...")
				await prepareQuizRound(topics)
			} else {
				closeReadLine()
				exitQuizgen()
			}
		},
		QUIZ_DEFAULTS.COUNTDOWN_DELAY,
		COUNTDOWN_CONFIG.MESSAGE,
		COUNTDOWN_CONFIG.PHRASES
	)
}

export function exitQuizgen() {
	const count = quizSessions.length
	if (count > 0) {
		console.log(
			`\nYou did ${count} quiz${
				count === 1 ? "" : "zes"
			}. Your result(s):\n`
		)

		console.log(getAllQuizScores(quizSessions).join("\n"), "\n")

		console.log(getOverallCorrect(quizSessions))
	}
	console.log("See you next time. Exiting...")
}
