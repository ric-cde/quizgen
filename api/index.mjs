// import "dotenv/config"
import OpenAI from "openai"
import questionInstructions from "./question-instructions.js"

const client = new OpenAI({
	apiKey: import.meta.env.OPENAI_API_KEY,
	dangerouslyAllowBrowser: true,
})

export async function generateQuestionSet(
	{ title, difficulty = "12th grade level", model = "gpt-4.1-mini" },
	{ count }
) {
	const prompt = buildPrompt(title, count, difficulty)
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

export function buildPrompt(title, count, difficulty) {
	return `Generate a quiz based on the subject of ${title}. The questions should be logical and robust, with a difficulty level of ${difficulty}. Output format must be in JSON.
	
	<topic>${title}</topic>
	<question_count>${count}</question_count>
	<difficulty>${difficulty}</difficulty>`
}

export const handler = async (event) => {
	// 1. Handle Preflight (OPTIONS) - AWS often handles this, but this is a safety net
	const corsHeaders = {
		"Access-Control-Allow-Origin": "*", // Potentially restrict to GitHub Pages URL
		"Access-Control-Allow-Headers": "Content-Type",
		"Access-Control-Allow-Methods": "POST, OPTIONS",
	}

	if (
		event.requestContext &&
		event.requestContext.http &&
		event.requestContext.http.method === "OPTIONS"
	) {
		return { statusCode: 200, headers: corsHeaders }
	}

	try {
		// 2. Parse the incoming body (from your React app)
		const body = JSON.parse(event.body || "{}")

		const { questionSet, config } = body

		const response = await generateQuestionSet(questionSet, config)
		const data = await response.json()

		// // 3. Call OpenAI (using Node 20 native fetch)
		// const openAIResponse = await fetch(
		// 	"https://api.openai.com/v1/chat/completions",
		// 	{
		// 		method: "POST",
		// 		headers: {
		// 			"Content-Type": "application/json",
		// 			Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
		// 		},
		// 		body: JSON.stringify({
		// 			model: "gpt-4o-mini", // Cost-efficient model
		// 			messages: [{ role: "user", content: userPrompt }],
		// 			max_tokens: 150,
		// 		}),
		// 	}
		// )

		// 4. Return the result
		return {
			statusCode: 200,
			headers: corsHeaders,
			body: JSON.stringify(data),
		}
	} catch (error) {
		console.error("Error:", error)
		return {
			statusCode: 500,
			headers: corsHeaders,
			body: JSON.stringify({
				error: "Failed to fetch response from OpenAI",
			}),
		}
	}
}
