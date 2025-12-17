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

	// three types of "updates":
	// 1) createSession with brand new bank/questions (no existing)
	// 2) createSession existing bank (existing, but no changes)
	// 3) completeSession with updated questions (existing, need changes)

	const existingQuestions = existing.questions || []
	const incomingQuestions = updates.questions || []

	const questionMap = new Map(existingQuestions.map((q) => [q.id, q]))

	// overwrite existing questions with matches from incoming updates, if any
	incomingQuestions.forEach((q) => {
		questionMap.set(q.id, q)
	})

	// turn map back into array
	const mergedQuestions = [...questionMap.values()]

	const now = new Date().toISOString()

	banks[quizId] = {
		createdAt: now, // overwritten if date already in existing
		...existing,
		...updates,
		questions: mergedQuestions,
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

export const saveLiveSession = async (session) => {
	if (session === null || session === undefined)
		throw new Error("Session object required.")
	sessionStorage.setItem("currentQuizSession", JSON.stringify(session))
	return true
}

export const loadSession = async (id) => {
	if (!id) throw new Error("Session id required.")

	const liveSession = getLiveSession()
	// if no liveSession, fallback to localStorage
	if (liveSession?.id === id) {
		return liveSession
	}

	const sessions = getSessions()
	const session = sessions[id]

	if (session) return session
	else throw new Error(`No session found with id: ${id}`)
}

export const loadTopics = async () => {
	// returns list of topic objects and basic metadata for list card view
	const banks = getQuestionBanks() || {}

	return (
		Object.values(banks).map((b) => ({
			title: b.title,
			description: b.description || "",
			count: b.questions?.length || 0,
			id: b.id,
		})) || []
	)
}

export const loadQuizSessions = async (quizId) => {
	if (!quizId) throw new Error("QuizId required.")
	const allSessions = getSessions()
	return Object.values(allSessions).filter((s) => s.quizId === quizId) || []
}

export const deleteTopic = async (quizId) => {
	if (!quizId) throw new Error("QuizId required.")

	const banks = getQuestionBanks()
	if (!banks?.[quizId])
		throw new Error(`No question bank found for quizId: ${quizId}`)

	const updatedBanks = { ...banks }
	delete updatedBanks[quizId]

	localStorage.setItem("questionBanks", JSON.stringify(updatedBanks))
	return quizId
}

const getLiveSession = () => {
	const session = sessionStorage.getItem("currentQuizSession")
	return session ? JSON.parse(session) : null
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
	loadQuizSessions,
	saveQuestionBank,
	saveSession,
	saveLiveSession,
	loadTopics,
}
