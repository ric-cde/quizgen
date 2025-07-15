import fs from "fs"
import path from "path"
import readline from "node:readline"
import sanitiseInput from "./helpers.js"

let quizSessions = []

const rl = readline.createInterface({
	input: process.stdin,
	output: process.stdout,
})

rl.on("close", () => {
	const quizCount = quizSessions.length
	if (quizSessions.length > 0) {
		console.log(
			`\nYou did ${quizCount} quiz${
				quizCount === 1 ? "" : "zes"
			}. Your result(s):\n`
		)
		for (let i = 0; i < quizCount; i++) {
			if (quizSessions[i].completed) {
				// use the topic, score, total, and completed values
				const { correct, total, score } = quizSessions[i]
				console.log(
					`${quizSessions[i].topic}: ${correct} out of ${total} (${score}%).`
				)
			}
		}
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
		console.log(
			`\nOverall, you answered of ${overallCorrect} out of ${overallTotal} correctly (${overallScore}%)\n`
		)
	}
	console.log("See you next time. Exiting...")
	process.exit(0)
})

async function startQuizRound(topics) {
	console.log(
		`The following topics are available:\n\n${topics.join("\n")}\ncustom\n`
	)
	const topic = await requestTopic(topics)
	console.log(`\nGreat! Get ready to dive deep on ${topic}.`)

	const questions = await loadQuestions(topic)

	console.log("\nQuiz round starting...")
	const countdownPhrases = ["Ready, ", "steady", "go!\n"]
	let i = 0
	const timer = setInterval(() => {
		console.log(countdownPhrases[i])
		i++
		if (i === 3) {
			clearInterval(timer)
			runQuestionSet(questions, topics)
		}
	}, 500)
}

function requestTopic(topics) {
	return new Promise((resolve) => {
		function ask() {
			rl.question(
				`Which one would you like to test your mettle on? \n`,
				(input) => {
					const userTopic = sanitiseInput(input)
					if (userTopic === "custom") {
						resolve(generateCustomTopic(topics))
					} else if (topics.includes(userTopic)) {
						resolve(userTopic)
					} else {
						console.log("Topic not found. Try again.")
						ask()
					}
				}
			)
		}
		ask()
	})
}

function generateCustomTopic(topics) {
	return new Promise((resolve) => {
		function ask() {
			rl.question("What custom topic would you like? ", (topic) => {
				const customTopic = sanitiseInput(topic)
				if (!customTopic) {
					console.log("Invalid topic name. Please use only letters.")
					ask()
					return
				}
				if (!topics.includes(customTopic)) {
					const customQuestionSet = {
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
						fs.writeFileSync(
							`./topics/${customTopic}.json`,
							JSON.stringify(customQuestionSet, null, 2)
						)
						topics.push(customTopic)
						console.log(`${customTopic} added to library.`)
					} catch (err) {
						console.log("error:", err)
					}

					resolve(customTopic)
				} else {
					console.log("Topic already exists. Try another.")
					ask()
				}
			})
		}
		ask()
	})
}

const loadQuestions = async (topic) => {
	try {
		const questionSet = JSON.parse(
			fs.readFileSync(`./topics/${topic}.json`, "utf-8")
		)
		if (
			!questionSet.questions ||
			!Array.isArray(questionSet.questions) ||
			questionSet.questions.length < 1
		) {
			console.log("No questions found. Restarting...")
			main()
		}
		const numberOfQuestions = await askQuestionCount(questionSet.questions)
		questionSet.questions = [...questionSet.questions]
			.sort(() => Math.random() - 0.5)
			.slice(0, numberOfQuestions)
		return questionSet
	} catch (err) {
		console.error("Error:", err)
		main()
	}
}

const askQuestionCount = (questions) => {
	return new Promise((resolve) => {
		function ask() {
			rl.question(
				`How many questions would you like to answer? Max: (${questions.length}) \n`,
				(count) => {
					// ensure input isn't "" or " ", check if it's a real number
					if (
						count.trim() !== "" &&
						!isNaN(Number(count)) &&
						count <= questions.length &&
						count > 0
					) {
						resolve(parseInt(count))
					} else {
						console.log(
							`Error: must choose a value between 1 and ${questions.length}`
						)
						ask()
					}
				}
			)
		}
		ask()
	})
}

async function runQuestionSet(questionSet, topics) {
	const quizSessionId =
		quizSessions.length > 0
			? quizSessions[quizSessions.length - 1].id + 1
			: 0
	const questions = questionSet.questions
	const quizSession = {
		id: quizSessionId,
		...questionSet,
		completed: false,
		correct: 0,
		total: questions.length,
		score: 0,
	}
	quizSessions.push(quizSession)

	for (let j = 0; j < questions.length; j++) {
		const currentQuestion = questions[j]
		await askQuestion(currentQuestion, quizSession)
	}

	quizSession.correct = questions.reduce(
		(acc, question) => (question.correct ? acc + 1 : acc),
		0
	)
	quizSession.score =
		quizSession.total > 0
			? Number(
					((100 * quizSession.correct) / quizSession.total).toFixed(2)
			  )
			: 0
	quizSession.completed = true

	console.log(
		`You scored ${quizSession.correct} out of ${quizSession.total} (${quizSession.score}%)!`
	)

	rl.question(
		"Would you like to play another round? [y] or [n] ",
		(response) => {
			const userResponse = sanitiseInput(response)
			const positiveAnswers = ["y", "yes", "ya", "sure", "ok"]
			if (positiveAnswers.includes(userResponse)) {
				console.log("Perfect, restarting the quiz...")
				startQuizRound(topics)
			} else {
				rl.close()
			}
		}
	)
}

async function askQuestion(question) {
	const round = new Promise((resolve) => {
		rl.question(question.prompt + " ", (answer) => {
			question.userAnswer = sanitiseInput(answer)
			if (question.answers.includes(question.userAnswer)) {
				console.log("Correct!\n")
				question.correct = true
			} else {
				console.log("Wrong. :(\n")
				question.correct = false
			}
			resolve()
		})
	})
	await round
}

const main = () => {
	try {
		const topics = fs
			.readdirSync("./topics")
			.filter((file) => path.extname(file) === ".json")
			.map((file) => path.parse(file).name)

		if (topics.length > 0) {
			console.log("Topics loaded.\n")
			console.log("Welcome to quiz generator! \n")
			startQuizRound(topics)
		} else {
			console.log("No topics found.")
			process.exit(0)
		}
	} catch (err) {
		console.error(err)
		console.log("Could not load topics.")
		process.exit(0)
	}
}

console.clear()
main()

// choose 5 questions at random and store in array [✔️]

// loop through the array, posing each question. [✔️]

// Write 1 or 0 to score. [✔️]

// calculate score [✔️]

// present score. [✔️]

// ask if user wants to continue w/ another question set [✔️]

// fix: move topic list to before requestTopic execution [✔️]

// let user type custom for a custom topic, then type in the topic [✔️]

// STRETCH: let user choose how many questions [✔️]

// cleanup: validate user input for # of questions is: a) a number, b) in range. [✔️]
// Add more error handling (setQuestions) [✔️]

// store responses + scoring in separate object/array (not on questions object), e.g. quizSession {quizId, completed (true), correct, total, score%}. When exiting, generate report of how user did across all rounds [✔️]

// split functions into modules/files []

// program makes request to openAI API to generate JSON question set (10 questions), then usual flow (user chooses how many), etc. []

// Questions can be stored in memory or written to .json file. (Perhaps ask user afterwards if they want to save to file). []

// LLM logic: generate JSON according to template. Show examples. Second step to check + verify questions. []

// rl.close() ??? []
