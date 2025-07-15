function sanitiseInput(input) {
	const userAnswer = input
		.toLowerCase()
		.trim()
		.normalize("NFD")
		.replace(/[\u0300-\u036f]/g, "")
		.replace(/[^\w\s\-.,!?]/g, "")
	
	if (
		userAnswer.includes("..") ||
		userAnswer.includes("/") ||
		userAnswer.includes("\\") ||
		/[<>:"|?*]/.test(userAnswer)
	) {
		return ""
	}
	
	return userAnswer
}

export default sanitiseInput
