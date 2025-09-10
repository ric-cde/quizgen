import "dotenv/config"
import OpenAI from "openai"
import questionInstructions from "../prompts/question-instructions.js"

const client = new OpenAI({
	apiKey: process.env.OPENAI_API_KEY,
})

export async function generateQuestionSet(
	topic,
	count,
	difficulty = "12th grade level",
	model = "gpt-4.1-mini"
) {
	const prompt = buildPrompt(topic, count, difficulty)
	const instructions = questionInstructions(count)
	try {
		const response = await client.responses.create({
			model,
			instructions,
			input: prompt,
			store: false,
			// temperature: 1,
			text: {
				format: {
					type: "json_object",
				},
			},
		})

		console.log(response.output_text)
		logUsage(response.usage)

		// TODO: build return object that includes all details, incl. prompt
		// TODO: service both adds to Db AND returns to user/UI

		return JSON.parse(response.output_text)
	} catch (err) {
		console.error("Failed to generate quiz from AI: ", err)
		throw err
	}
}

function logUsage(usage) {
	// console.log(usage)
	const { input_tokens, output_tokens } = usage
	const input_price = (input_tokens / 1000000) * 0.1
	const output_price = (output_tokens / 1000000) * 0.4
	const total_price = input_price + output_price
	console.log(`Total price: \$${total_price}`)
}

export function buildPrompt(topic, count, difficulty) {
	return `Generate a quiz based on the subject of ${topic}. The questions should be logical and robust, with a difficulty level of ${difficulty}. Output format must be in JSON.
	
	<topic>${topic}</topic>
	<question_count>${count}</question_count>
	<difficulty>${difficulty}</difficulty>`
}
