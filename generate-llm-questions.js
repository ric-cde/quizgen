import "dotenv/config"
import OpenAI from "openai"
// import fs from "fs"
// import path from "path"
// import { fileURLToPath } from "url"

// const __filename = fileURLToPath(import.meta.url)
// const __dirname = path.dirname(__filename)

// const instructions = fs.readFileSync(
// 	path.join(__dirname, "../prompts/question-instructions-prompt.txt"),
// 	"utf8"
// )

import instructions from "./src/prompts/question-instructions-prompt.js"

const topic = process.argv[2]
const difficulty = "up to a 12th grade level"
const prompt = `Generate a quiz based on the subject of ${topic}. The questions should be reasonably challenging, ${difficulty}. Output format must be in JSON.`

async function main() {
	const client = new OpenAI({
		apiKey: process.env.OPENAI_API_KEY,
	})

	const response = await client.responses.create({
		model: "gpt-4.1-mini",
		instructions: instructions,
		input: prompt,
		store: false,
		temperature: 1,
		text: {
			format: {
				type: "json_object",
			},
		},
	})
	console.log(response.usage)
	const { input_tokens, output_tokens } = response.usage

	const input_price = (input_tokens / 1000000) * 0.1
	const output_price = (output_tokens / 1000000) * 0.4
	const total_price = input_price + output_price

	console.log(`Total price: \$${total_price}`)

	console.log(response.output_text)
}

main()
