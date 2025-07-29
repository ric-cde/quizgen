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
