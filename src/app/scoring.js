function getOverallCorrect(quizSessions) {
	const overallCorrect = quizSessions.reduce(
		(acc, session) => acc + session.correct,
		0
	)
	const overallTotal = quizSessions.reduce(
		(acc, session) => acc + session.total,
		0
	)
	const overallScore =
		overallTotal > 0
			? Number(((100 * overallCorrect) / overallTotal).toFixed(2))
			: 0
	return `Overall, you answered ${overallCorrect} out of ${overallTotal} correctly (${overallScore}%).\n`
}

function getAllQuizScores(quizSessions) {
	return quizSessions.reduce((acc, session) => {
		session.completed
			? acc.push(`${session.topic}: ${session.result}.`)
			: null
		return acc
	}, [])
}

function calcQuizScore({ questions, total }) {
	const correct = questions.reduce(
		(acc, question) => (question.correct ? acc + 1 : acc),
		0
	)
	const score = total > 0 ? Number(((100 * correct) / total).toFixed(2)) : 0
	const result = `${correct} out of ${total} (${score}%)`
	const completed = true

	return { correct, score, completed, result }
}

export { calcQuizScore, getAllQuizScores, getOverallCorrect }
