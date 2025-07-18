import { calcQuizScore } from "./scoring.js"
import { promptUser } from "../io/cli.js"
import {
	POSITIVE_RESPONSES,
	SUCCESS_MESSAGES,
	PROMPTS,
} from "../utils/constants.js"

export async function runQuestionSet(questionSet, quizSessions) {
	const quizSessionId = generateNextSessionid(quizSessions)

	const quizSession = createQuizSession(questionSet, quizSessionId)
	quizSessions.push(quizSession)
	const questions = quizSession.questions

	for (let j = 0; j < questions.length; j++) {
		const currentQuestion = questions[j]
		const { userAnswer, correct } = await askQuestion(currentQuestion)
		currentQuestion.userAnswer = userAnswer
		currentQuestion.correct = correct
	}

	const scoreData = calcQuizScore(quizSession)
	Object.assign(quizSession, scoreData)

	console.log(`You scored: ${quizSession.result}!`)
}

export async function askForReplay() {
	const response = await promptUser(PROMPTS.REPLAY)
	return POSITIVE_RESPONSES.includes(response)
}

function createQuizSession(questionSet, quizSessionId) {
	const quizSession = {
		id: quizSessionId,
		topic: questionSet.topic,
		desc: questionSet.desc,
		questions: questionSet.questions.map((q) => ({ ...q, correct: null })),
		completed: false,
		correct: 0,
		total: questionSet.questions.length,
		score: 0,
		result: null,
		startTime: new Date(),
	}
	return quizSession
}

function generateNextSessionid(quizSessions) {
	const quizSessionId =
		quizSessions.length > 0
			? quizSessions[quizSessions.length - 1].id + 1
			: 0
	return quizSessionId
}

async function askQuestion(question) {
	const userAnswer = await promptUser(
		PROMPTS.QUESTION_ANSWER(question.prompt)
	)
	const correct = checkAnswer(question, userAnswer)
	return { userAnswer, correct }
}

function checkAnswer(question, userAnswer) {
	if (question.answers.includes(userAnswer)) {
		console.log(SUCCESS_MESSAGES.CORRECT_ANSWER)
		return true
	} else {
		console.log(SUCCESS_MESSAGES.WRONG_ANSWER)
		return false
	}
}
