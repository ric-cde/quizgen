import { loadTopicFromFile, writeTopicToFile } from "../io/file-manager.js"
import { promptUser } from "../io/cli.js"


export async function requestTopic(topics) {
	const userTopic = await promptUser(
		`Which one would you like to test your mettle on? \n`
	)
	if (userTopic === "custom") {
		return generateCustomTopic(topics)
	} else if (topics.includes(userTopic)) {
		return userTopic
	} else {
		console.log("Topic not found. Try again.")
		return await requestTopic(topics)
	}
}

export async function loadQuestions(topic) {
	try {
		const questionSet = await loadTopicFromFile(topic)

		if (
			!questionSet.questions ||
			!Array.isArray(questionSet.questions) ||
			questionSet.questions.length < 1
		) {
			console.log("No questions found.")
			return null
		}
		return questionSet
	} catch (err) {
		console.error("Error:", err)
		return null
	}
}

export async function selectRandomQuestions(questions) {
	const numberOfQuestions = await askQuestionCount(questions)

	questions = questions
		.sort(() => Math.random() - 0.5)
		.slice(0, numberOfQuestions)

	return questions
}

export async function generateCustomTopic(topics) {
	const customTopic = await promptUser("What custom topic would you like? ")
	if (!customTopic) {
		console.log("Invalid topic name. Please use only letters.")
		return await generateCustomTopic(topics)
	}
	if (!topics.includes(customTopic)) {
		const questionSet = {
			topic: customTopic,
			desc: "Custom questions.",
			questions: [
				{
					prompt: "sample custom question?",
					answers: ["yes", "no"],
				},
				{
					prompt: "another sample?",
					answers: ["yes", "no"],
				},
			],
		}

		try {
			await saveTopic(customTopic, questionSet)
			topics.push(customTopic)
			console.log(`${customTopic} added to library.`)
			return customTopic
		} catch (err) {
			console.log("error:", err)
			return await generateCustomTopic(topics)
		}
	} else {
		console.log("Topic already exists. Try another.")
		return await generateCustomTopic(topics)
	}
}

async function saveTopic(customTopic, questionSet) {
	await writeTopicToFile(customTopic, questionSet)
}

async function askQuestionCount(questions) {
	const count = await promptUser(
		`How many questions would you like to answer? Max: (${questions.length}) \n`
	)

	if (
		count.trim() !== "" &&
		!isNaN(Number(count)) &&
		count <= questions.length &&
		count > 0
	) {
		return parseInt(count)
	} else {
		console.log(
			`Error: must choose a value between 1 and ${questions.length}`
		)
		return await askQuestionCount(questions)
	}
}
