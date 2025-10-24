import QUIZ_DEFAULTS from "@/lib/constants.ts"
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
	let updatedQuestionBank = { ...questionSet, quizId }
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

	await saveLiveSession(session)
	const success = saveSession(session.id, session)
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
		quizId,
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
		quizId,
		id: nanoid(10),
		title,
		description,
		difficulty,
		grade,
		questions,
		status: "draft",
		createdAt: new Date().toISOString(),
		currentQuestionIndex: 0,
	}
}

export const updateSession = async (session) => {}

export const completeSession = async (session) => {
	// use results to calculate score

	// const score =
	// const updatedSession = {...session, status: "complete", updatedAt: new Date().toISOString()}

	// save the session into localstorage
	const success = saveSession(updatedSession.id, updateSession)
	if (!success) throw new Error("Failed to save session")
	// clear the currentQuizSession in sessionStorage
	await saveLiveSession({})

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

function addQuestionsMetadata(
	{ questions, difficulty },
	lastQuestionTrancheId
) {
	return questions.map((question) => ({
		...question,
		questionTrancheId: lastQuestionTrancheId + 1,
		difficulty: difficulty,
		createdAt: new Date().toISOString(),
		attempts: [],
		id: nanoid(6),
		attemptCount: 0,
		correctCount: 0,
	}))
}

export const checkAnswer = ({ answers }, userAnswer) => {
	// receives question object and user guess
	const isCorrect = answers.some(
		(a) => a.toLowerCase() === userAnswers.toLowerCase()
	)

	const isYesNo = answers.some((a) => a === "yes" || a === "no")

	let otherAnswers
	if (isCorrect) {
		// if correct guess, show other answers
		if (answers.length > 1 && !isYesNo) {
			otherAnswers = answers.filter((answer) => userAnswer !== answer)
		}
	} else {
		// or show all answers
		otherAnswers = answers
	}

	return { isCorrect, otherAnswers }
}
