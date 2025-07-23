export function sanitiseInput(input) {
	const userAnswer = input
		.toLowerCase()
		.trim()
		.normalize("NFD")
		.replace(/[\u0300-\u036f]/g, "")
		.replace(/[^\w\s\-.,!?/]/g, "")

	if (
		userAnswer.includes("../") ||
		userAnswer.includes("..\\") ||
		userAnswer.includes("./") ||
		userAnswer.includes("..\\") ||
		/[<>:"|?*]/.test(userAnswer)
	) {
		return ""
	}

	return userAnswer
}

export function countdown(runFunction, delay, text, countdownPhrases) {
	console.log(text)
	let i = 0
	const timer = setInterval(() => {
		console.log(countdownPhrases[i])
		i++
		if (i >= countdownPhrases.length) {
			clearInterval(timer)
			runFunction()
		}
	}, delay)
}
