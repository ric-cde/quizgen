import { start, exitQuizgen } from "./quiz/engine.js"
import { closeReadLine } from "./io/cli.js"

process.on("SIGINT", () => {
	console.log("\nExiting...")
	exitQuizgen()
	closeReadLine()
	process.exit(0)
})

const main = async () => {
	await start()
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

// split functions into modules/files [✔️]

// program makes request to openAI API to generate JSON question set (10 questions), then usual flow (user chooses how many), etc. [✔️]

// transform answer array to lower-case [✔️]

// Ask user: how many questions they'd like to generate. Update llm-service to accommodate

// When selecting quiz, ask user: do existing questionSet(s) from file or generate new? If generating new, how many? (possibly combined function w/ above)

// After quiz, ask user: would you like to do topic again? (then existing Q's or generate new - combined with previous)?

// Generating additional Q's: New request made, questions get appended to answer array). []

// Structured Outputs conformity (JSON schema object): https://platform.openai.com/docs/guides/structured-outputs?api-mode=responses []

// questions array converted to questionSet array of question arrays.

// Questions can be stored in memory or written to .json file. (Perhaps ask user afterwards if they want to save to file). []

// LLM logic: generate JSON according to template. Show examples. Second step to check + verify questions. []