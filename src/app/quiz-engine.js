import { askForReplay, runQuestionSet } from "./quiz-runner.js"

import {
	requestTopic,
	loadQuestions,
	selectRandomQuestions,
} from "./quiz-generator.js"

import { getAllQuizScores, getOverallCorrect } from "./scoring.js"

import { closeReadLine } from "../io/cli.js"

import { countdown } from "../utils/helpers.js"

let quizSessions = []

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
			await runQuestionSet(questionSet, topics, quizSessions)

			if (await askForReplay()) {
				console.log("Perfect, restarting the quiz...")
				await prepareQuizRound(topics)
			} else {
				closeReadLine()
				exitQuizgen()
			}
		},
		5,
		"\nQuiz round starting...",
		["Ready, ", "steady", "go!\n"]
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
