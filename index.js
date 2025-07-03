import fs from "fs"
import path from "path"
import readline from "node:readline"
import sanitiseInput from "./helpers.js"

const rl = readline.createInterface({
	input: process.stdin,
	output: process.stdout,
})

rl.on("close", () => {
	console.log("See you next time. Exiting...")
	process.exit(0)
})

async function doQuiz(topics) {
	console.log(
		`Welcome to quiz generator! The following topics are available:\n\n${topics.join(
			"\n"
		)}\ncustom\n`
	)
	const topic = await requestTopic(topics)
	console.log(`\nGreat! Get ready to dive deep on ${topic}`)
	const questions = await setQuestions(topic)

	console.log("\nQuiz round starting in...")
	let i = 1
	const timer = setInterval(() => {
		console.log(i + `${i === 1 ? "!" : ""}`)
		i--
		if (i === 0) {
			clearInterval(timer)

			doQuestionSet(questions, topics)
		}
	}, 1000)
}

function requestTopic(topics) {
	return new Promise((resolve) => {
		function ask() {
			rl.question(
				`Which topic would you like to test your mettle on? \n`,
				(userTopic) => {
					if (sanitiseInput(userTopic) === "custom") {
						resolve(generateCustomTopic())
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

const setNumberOfQuestions = (questions) => {
	return new Promise((resolve) => {
		function ask() {
			rl.question(
				`How many questions would you like to answer? Max: (${questions.length}) \n`,
				(count) => {
					resolve(count)
				}
			)
		}
		ask()
	})
}

const setQuestions = async (topic) => {
	try {
		const questionSet = await JSON.parse(
			fs.readFileSync(`./topics/${topic}.json`, "utf-8")
		)
		const numberOfQuestions = await setNumberOfQuestions(
			questionSet.questions
		)
		const selectedQuestions = [...questionSet.questions]
			.sort(() => Math.random() - 0.5)
			.slice(0, numberOfQuestions)
		return selectedQuestions
	} catch (err) {
		console.error("Error:", err)
	}
}

async function askQuestion(question) {
	const round = new Promise((resolve) => {
		rl.question(question.prompt + " ", (answer) => {
			const userAnswer = sanitiseInput(answer)
			if (question.answers.includes(userAnswer)) {
				console.log("Correct!")
				question.score = 1
			} else {
				console.log("Wrong. :(")
				question.score = 0
			}
			resolve()
		})
	})
	await round
}

async function doQuestionSet(questions, topics) {
	for (let j = 0; j < questions.length; j++) {
		const currentQuestion = questions[j]
		await askQuestion(currentQuestion)
	}
	const score = questions.reduce((acc, val) => acc + val.score, 0)
	console.log(`You scored ${score} out of ${questions.length}!`)

	rl.question(
		"Would you like to play another round? [y] or [n] ",
		(answer) => {
			const userAnswer = sanitiseInput(answer)
			const positiveAnswers = ["y", "yes", "ya", "sure", "ok"]
			if (positiveAnswers.includes(userAnswer)) {
				console.log("Perfect, restarting the quiz...")
				doQuiz(topics)
			} else {
				rl.close()
			}
		}
	)
}

const main = () => {
	console.clear()
	try {
		const topics = fs
			.readdirSync("./topics")
			.map((file) => path.parse(file).name)

		if (topics.length > 0) {
			console.log("Topics loaded.")
			doQuiz(topics)
		} else {
			console.log("No topics found.")
			process.exit(0)
		}
	} catch (err) {
		console.error(err)
		console.log("Could not load topics")
		process.exit(0)
	}
}

main()

// choose 5 questions at random and store in array [✔️]

// loop through the array, posing each question. [✔️]

// Write 1 or 0 to score. [✔️]

// calculate score [✔️]

// present score. [✔️]

// ask if user wants to continue w/ another question set [✔️]

// fix: move topic list to before requestTopic execution [✔️]

// STRETCH: let user choose how many questions [✔️]

// cleanup: validate user input for # of questions is: a) a number, b) in range.
// Add more error handling (setQuestions)

// store responses + scoring in separate object/array (not on questions object), e.g. quizSession {quizId, correct, total, score%}. When exiting, generate report of how user did across all rounds []

// split functions into modules/files

// let user type custom for a customic topic, then type in the topic [✔️]

// program makes request to API to generate JSON question set (10 questions), then usual flow (user chooses how many), etc.
// Questions can be stored in memory or written to .json file. (Perhaps ask user afterwards if they want to save to file).

// LLM logic: generate JSON according to template. Show examples. Second step to check + verify questions.

// rl.close()
