function sanitiseInput(input) {
	const userAnswer = input
		.toLowerCase()
		.trim()
		.normalize("NFD")
		.replace(/[\u0300-\u036f]/g, "")
		.replace(/[^\w\s\-.,!?]/g, "")
	return userAnswer
}

export default sanitiseInput
