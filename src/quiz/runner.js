import { calcQuizScore } from "./scoring.js"
import { promptUser } from "../io/cli.js"
import { POSITIVE_RESPONSES, PROMPTS } from "../utils/constants.js"

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

	// TODO: future update logic for permanent scoring, etc. on questions array

	return await askForReplay()
}

export async function askForReplay(count) {
	const response = await promptUser(PROMPTS.REPLAY)
	return response
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

function checkAnswer({ answers }, userAnswer) {
	const isCorrect = answers.map((a) => a.toLowerCase()).includes(userAnswer)
	const isYesNo = ["yes", "no"].some((str) => answers.includes(str))
	let text = `${isCorrect ? "Correct!\n" : "Wrong!\n"}`

	if (isCorrect) {
		if (answers.length > 1 && !isYesNo) {
			const otherAnswers = answers.filter(
				(answer) => userAnswer !== answer
			)
			text += "Other correct answers: [" + otherAnswers.join("], [") + "]"
		}
	} else {
		if (answers.length > 1 && !isYesNo) {
			text += "Correct answers: [" + answers.join("], [") + "]"
		} else if (answers.length === 1) {
			text += "Correct answer: [" + answers[0] + "]"
		}
	}

	console.log(text)
	return isCorrect
}
