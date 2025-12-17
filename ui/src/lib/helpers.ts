// @ts-nocheck

export function sanitiseInput(input) {
	const userAnswer = input
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

export function slugify(topicName, maxWord = 10, maxLength = 40) {
	const sanitiseSlug = (input) =>
		input
			.replace(/[^a-z0-9\s_-]/g, "") // remove all special characters
			.replace(/[\s_]+/g, "-") // replace spaces (incl. multi-spaces) with hyphens)
			.replace(/-+/g, "-") // replace consecutive hyphens with single one
			.replace(/^-+|-+$/g, "") // remove dashes at start/end

	let slug = topicName
	slug = sanitiseSlug(slug.trim().toLowerCase())

	if (slug.length > maxLength) {
		const words = slug.split("-")
		const fillerWords = new Set([
			"a",
			"an",
			"and",
			"are",
			"as",
			"at",
			"be",
			"by",
			"for",
			"from",
			"has",
			"he",
			"in",
			"is",
			"it",
			"its",
			"of",
			"on",
			"that",
			"the",
			"to",
			"was",
			"were",
			"will",
			"with",
			"what",
			"when",
			"where",
			"who",
			"why",
			"how",
			"the",
			"i",
			"me",
			"my",
			"myself",
			"we",
			"our",
			"ours",
			"ourselves",
			"you",
			"your",
		])

		let filteredWords = words.filter((w) => !fillerWords.has(w))
		slug = filteredWords.length > 2 ? filteredWords.join("-") : slug

		if (slug.length > maxLength) {
			const trimmedWords = filteredWords.map((w) =>
				w.substring(0, maxWord)
			)

			slug = trimmedWords.join("-")

			if (slug.length > maxLength) {
				slug = slug.substring(0, maxLength)
			}
		}
	}

	return sanitiseSlug(slug)
}


export const millisecondsToMinsSecs = (total) => {
	const totalSeconds = Math.floor(total / 1000)
	const minutes = Math.floor(totalSeconds / 60)
	const seconds = totalSeconds % 60
	return `${minutes}:${seconds.toString().padStart(2, "0")}`
}