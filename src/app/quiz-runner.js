import { calcQuizScore } from "./scoring.js"
import { promptUser } from "../io/cli.js"

export async function runQuestionSet(questionSet, topics, quizSessions) {
	const quizSession = createQuizSession(quizSessions, questionSet)
	quizSessions.push(quizSession)

	for (let j = 0; j < questionSet.questions.length; j++) {
		const currentQuestion = questionSet.questions[j]
		await askQuestion(currentQuestion, quizSession)
	}

	const scoreData = calcQuizScore(quizSession)
	Object.assign(quizSession, scoreData)

	console.log(`You scored: ${quizSession.result}!`)
}

export async function askForReplay() {
	const response = await promptUser(
		"Would you like to play another round? [y] or [n] "
	)
	const positiveAnswers = ["y", "yes", "ya", "sure", "ok"]
	return positiveAnswers.includes(response)
}

function createQuizSession(quizSessions, questionSet) {
	const quizSessionId =
		quizSessions.length > 0
			? quizSessions[quizSessions.length - 1].id + 1
			: 0

	const quizSession = {
		id: quizSessionId,
		...questionSet,
		completed: false,
		correct: 0,
		total: questionSet.questions.length,
		score: 0,
		result: null,
	}
	return quizSession
}

async function askQuestion(question) {
	question.userAnswer = await promptUser(question.prompt + " ")
	checkAnswer(question, question.userAnswer)
	return
}

function checkAnswer(question, userAnswer) {
	if (question.answers.includes(userAnswer)) {
		console.log("Correct!\n")
		question.correct = true
	} else {
		console.log("Wrong. :(\n")
		question.correct = false
	}
}
