import { prepareQuizRound, exitQuizgen } from "./app/quiz-engine.js"
import { loadTopicNames } from "./io/file-manager.js"
import { closeReadLine } from "./io/cli.js"

process.on("SIGINT", () => {
	console.log("\nExiting...")
	exitQuizgen()
	closeReadLine()
	process.exit(0)
})

const main = async () => {
	try {
		const topics = await loadTopicNames()

		if (topics.length > 0) {
			console.log("Topics loaded.\n")
			console.log("Welcome to quiz generator! \n")
			await prepareQuizRound(topics)
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
