import { calcQuizScore } from "./scoring.js"
import { updateQuestionSet } from "./generator.js"
import { promptUser } from "../io/cli.js"
import { POSITIVE_RESPONSES, PROMPTS } from "../utils/constants.js"
import { randomUUID } from "node:crypto"

export async function runQuestionSet(questionSet, quizSessions) {
	const quizSessionId = generateNextSessionId(quizSessions)

	const quizSession = createQuizSession(questionSet, quizSessionId)
	quizSessions.push(quizSession)
	await loopThroughQuestions(quizSession.questions)

	const scoreData = calcQuizScore(quizSession)
	Object.assign(quizSession, scoreData)

	console.log(`You scored: ${quizSession.result}!`)

	await updateQuestionSet(questionSet.slug, quizSession.questions)
	return await askForReplay()
}

export async function askForReplay(count) {
	const response = await promptUser(PROMPTS.REPLAY)
	return response
}

export function createQuizSession(questionSet, quizSessionId) {
	const quizSession = {
		id: quizSessionId,
		topic: questionSet.topic,
		desc: questionSet.desc,
		questions: [...questionSet.questions],
		completed: false,
		correct: 0,
		total: questionSet.questions.length,
		score: 0,
		result: null,
		startTime: new Date(),
	}
	return quizSession
}

export function generateNextSessionId(quizSessions) {
	const quizSessionId =
		quizSessions.length > 0
			? quizSessions[quizSessions.length - 1].id + 1
			: 0
	return quizSessionId
}

export async function loopThroughQuestions(questions) {
	for (let j = 0; j < questions.length; j++) {
		const currentQuestion = questions[j]
		const { userAnswer, isCorrect } = await askQuestion(currentQuestion)
		const questionAttempt = {
			userAnswer,
			isCorrect,
			answeredAt: new Date(),
			id: randomUUID(),
			answersAtTime: [...currentQuestion.answers],
		}
		if (currentQuestion.attempts) {
			currentQuestion.attempts = [
				...currentQuestion.attempts,
				questionAttempt,
			]
		} else {
			currentQuestion.attempts = [questionAttempt]
		}
		currentQuestion.correctCount =
			(currentQuestion.correctCount ?? 0) + (isCorrect ? 1 : 0)
		currentQuestion.attemptCount = (currentQuestion.attemptCount ?? 0) + 1
	}
}

export async function askQuestion(question) {
	const userAnswer = await promptUser(
		PROMPTS.QUESTION_ANSWER(question.prompt)
	)
	const isCorrect = checkAnswer(question, userAnswer)
	return { userAnswer, isCorrect }
}

export function checkAnswer({ answers }, userAnswer) {
	const isCorrect = answers.some(
		(a) => a.toLowerCase() === userAnswer.toLowerCase()
	)

	const isYesNo = answers.some((a) => a === "yes" || a === "no")

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
