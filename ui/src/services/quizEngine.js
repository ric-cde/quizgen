import { QUIZ_DEFAULTS } from "@/lib/constants.ts"
import { nanoid } from "nanoid"
import { generateQuestionSet } from "@/services/generator.js"
import {
	saveQuestionBank,
	saveLiveSession,
	saveSession,
} from "@/services/storage.js"

export const createSession = async (questionSet, config) => {
	const { questions } = questionSet
	const { enableGenerate, mode } = config

	const quizId = mode === "new" ? nanoid(10) : config.quizId

	// attempt to generate new questions if needed
	let updatedQuestionBank = { ...questionSet, id: quizId }
	let newQuestionSet = { questions: [] }
	if (config.enableGenerate === true) {
		;({ updatedQuestionBank, newQuestionSet } =
			await handleQuestionGeneration(questionSet, config, quizId))
	}

	if (mode === "new" || enableGenerate === true) {
		await saveQuestionBank(quizId, updatedQuestionBank)
	}

	// Prepare questions. Depending on questionMix, select/randomise questions for current round (active questionSet)
	const sessionQuestions = selectQuestionMix(
		questions,
		newQuestionSet.questions,
		config
	)
	if (sessionQuestions.length === 0) {
		throw new Error("Cannot create session without questions")
	}
	const session = buildSession(updatedQuestionBank, sessionQuestions, quizId)

	saveLiveSession(session)
	const success = await saveSession(session.id, session)
	if (!success) throw new Error("Failed to save session")
	return session.id
}

async function handleQuestionGeneration(questionSet, config, quizId) {
	const {
		title,
		description,
		difficulty = QUIZ_DEFAULTS.DIFFICULTY,
		grade,
		questions,
	} = questionSet

	let newQuestionSet

	try {
		newQuestionSet = await generateQuestionSet({
			title,
			description,
			difficulty,
			grade,
			count: config.newQuestionCount || QUIZ_DEFAULTS.NEW_QUESTIONS,
			questions,
			extend: questions?.length ? true : false,
		})
	} catch (err) {
		throw new Error(`Failed to generate questions: ${err.message}`)
	}

	const lastQuestionTrancheId =
		questions?.length > 0
			? Math.max(...questions.map((q) => q.questionTrancheId)) || 0
			: 0

	newQuestionSet.questions = addQuestionsMetadata(
		newQuestionSet,
		lastQuestionTrancheId
	)

	const updatedQuestionBank = {
		...questionSet,
		id: quizId,
		description: newQuestionSet.description,
		questions: [...questionSet.questions, ...newQuestionSet.questions],
	}
	return {
		updatedQuestionBank,
		newQuestionSet,
	}
}

function buildSession(questionBank, questions, quizId) {
	const { title, description, difficulty, grade } = questionBank
	return {
		id: nanoid(10),
		quizId,
		status: "draft",
		questionIndex: 0,
		title,
		description,
		difficulty,
		grade,
		questions,
		createdAt: new Date().toISOString(),
		attempted: 0,
		correct: 0,
		skipped: 0,
	}
}

// export const updateSession = async (newSession) => {
// 	// used to non-destructively update, e.g. questions array
// 	// is this necessary? if so, why?
// }

export const completeSession = async (session) => {
	console.log("completing session...")
	// save the session into localstorage

	const { title, description, difficulty, grade, quizId, questions } = session

	// in future, possibly only update questions (and relevant metadata) as other props only changed during compose/generate
	const updatedQuestionBank = {
		title,
		description,
		difficulty,
		grade,
		id: quizId,
		questions,
	}

	try {
		await saveSession(session.id, session)
		// save the updated questionBank w/ updated attempts array
		await saveQuestionBank(quizId, updatedQuestionBank)
	} catch (err) {
		throw new Error(`Failed to complete session: ${err.message}`)
	}

	// clear the currentQuizSession in sessionStorage
	saveLiveSession({})

	return true
}

function selectQuestionMix(existingQuestions, newQuestions, config) {
	const {
		questionMix,
		quizRunQuestionCount,
		newQuestionCount = QUIZ_DEFAULTS.NEW_QUESTIONS,
	} = config
	let sessionQuestions = []

	if (questionMix === "new") {
		sessionQuestions = newQuestions || []
	} else if (questionMix === "mix") {
		// merge a mixture of new questions and required number of randomised old questions
		const numberOfQuestions = quizRunQuestionCount - newQuestionCount

		sessionQuestions = [
			...(newQuestions || []),
			...selectRandomQuestions(existingQuestions, numberOfQuestions),
		]
	} else if (questionMix === "existing") {
		sessionQuestions = selectRandomQuestions(
			existingQuestions,
			quizRunQuestionCount
		)
	}
	return sessionQuestions
}

function selectRandomQuestions(questions, numberOfQuestions = 5) {
	// update to Fisher-Yates
	const shuffled = [...questions]
		.sort(() => Math.random() - 0.5)
		.slice(
			0,
			numberOfQuestions > questions.length
				? questions.length
				: numberOfQuestions
		)

	return shuffled
}

function addQuestionsMetadata({ questions }, lastQuestionTrancheId) {
	return questions.map((question) => ({
		...question,
		questionTrancheId: lastQuestionTrancheId + 1,
		createdAt: new Date().toISOString(),
		attempts: [],
		id: nanoid(6),
		attemptCount: 0,
		correctCount: 0,
		skippedCount: 0,
	}))
}

export const checkAnswer = ({ answers }, userAnswer) => {
	// receives question object and user guess

	const isCorrect = answers.some(
		(a) => a.toLowerCase() === userAnswer.toLowerCase()
	)

	// TODO add fuzzy match logic

	// const isYesNo = answers.some((a) => a === "yes" || a === "no")

	// TODO: if y/n, accept from list of postive/negative answers

	const questionAttempt = {
		userAnswer,
		isCorrect,
		createdAt: new Date(),
		id: nanoid(6),
		answersAtTime: answers,
	}

	return { isCorrect, questionAttempt }
}
