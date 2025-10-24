const mockGet = {} //mock data

export const loadQuestionBank = async (quizId) => {
	if (!quizId) throw new Error("QuizId required.")

	const banks = getQuestionBanks()
	if (!banks?.[quizId])
		throw new Error(`No question bank found for quizId: ${quizId}`)
	return banks[quizId]
}

export const loadQuestions = async (quizId) => {
	const { questions } = await loadQuestionBank(quizId)
	return questions || []
}

export const saveQuestionBank = async (quizId, updates) => {
	if (!quizId) throw new Error("QuizId required.")
	if (!updates) throw new Error("questionBank object is required.")

	const banks = getQuestionBanks()
	const existing = banks[quizId] || {}

	banks[quizId] = {
		...existing,
		...updates,
		updatedAt: new Date().toISOString(),
	}

	localStorage.setItem("questionBanks", JSON.stringify(banks))
	return banks[quizId]
}

export const saveSession = async (id, updates) => {
	if (!id) throw new Error("Session id required.")
	if (!updates) throw new Error("Session object is required.")

	const sessions = getSessions()
	const existing = sessions[id] || {}

	sessions[id] = {
		...existing,
		...updates,
		updatedAt: new Date().toISOString(),
	}

	localStorage.setItem("quizSessions", JSON.stringify(sessions))
	return sessions[id]
}

export const saveLiveSession = (session) => {
	sessionStorage.setItem("currentQuizSession", JSON.stringify(session))
	return true
}

export const loadTopics = () => {
	// returns list of topic objects and basic metadata for list card view
	const banks = getQuestionBanks()

	return Object.values(banks).map((b) => ({
		title: b.title,
		description: b.description,
		count: b.questions.length,
	})) || []
}

const getSessions = () => {
	const sessions = localStorage.getItem("quizSessions")
	return sessions ? JSON.parse(sessions) : {}
}

const getQuestionBanks = () => {
	const banks = localStorage.getItem("questionBanks")
	return banks ? JSON.parse(banks) : {}
}

export default {
	loadQuestionBank,
	loadQuestions,
	saveQuestionBank,
	saveSession,
	saveLiveSession,
	loadTopics,
}
