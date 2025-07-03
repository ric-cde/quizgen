import readline from "node:readline"

const randomNumber = Math.floor(Math.random() * 100) + 1

const rl = readline.createInterface({
	input: process.stdin,
	output: process.stdout,
})

console.log(randomNumber)
console.log("I'm thinking of a number between 0 and 100. What is it? ")

rl.on("line", (input) => {
	if (+input > randomNumber) {
		console.log("Too high.")
	} else if (+input < randomNumber) {
		console.log("Too low.")
	} else if (+input === randomNumber) {
		console.log("That's it! Congratulations. Exiting...")
		rl.close()
	} else {
		console.log("Doesn't look like a number. Try again please.")
	}
})

rl.on("close", () => {
	console.log("Goodbye.")
	process.exit(0)
})
