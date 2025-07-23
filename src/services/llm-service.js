import "dotenv/config"
import OpenAI from "openai"
import instructions from "../prompts/question-instructions-prompt.js"

const client = new OpenAI({
	apiKey: process.env.OPENAI_API_KEY,
})

export async function generateAiQuiz(
	topic,
	model = "gpt-4.1-mini",
	difficulty = "12th grade level"
) {
	const prompt = `Generate a quiz based on the subject of ${topic}. The questions should be reasonably challenging, up to a ${difficulty}. Output format must be in JSON.`

	try {
		const response = await client.responses.create({
			model,
			instructions: instructions,
			input: prompt,
			store: false,
			// temperature: 1,
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

		// TODO: build return object that includes all details, incl. prompt
		// TODO: service both adds to Db AND returns to user/UI

		return JSON.parse(response.output_text)
	} catch (err) {
		console.error("Failed to generate quiz from AI: ", error)
	}
}
