import readline from "node:readline/promises"
import { sanitiseInput } from "../utils/helpers.js"

const rl = readline.createInterface({
	input: process.stdin,
	output: process.stdout,
})

export async function promptUser(prompt) {
	const answer = await rl.question(prompt)
	return sanitiseInput(answer)
}

export async function promptUserRaw(prompt) {
	const answer = await rl.question(prompt)
	return answer
}

export function closeReadLine() {
	rl.close()
}
