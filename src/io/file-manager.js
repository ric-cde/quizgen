import fs from "fs/promises"
import path from "path"
import { TOPICS_DIR } from "../utils/constants.js"

export async function loadTopicNames() {
	try {
		const files = await fs.readdir(TOPICS_DIR)
		return files
			.filter((file) => path.extname(file) === ".json")
			.map((file) => path.parse(file).name)
	} catch (error) {
		throw new Error(`Failed to load topic names: ${error.message}`)
	}
}

export async function loadTopicFromFile(topic) {
	try {
		const data = await fs.readFile(`${TOPICS_DIR}/${topic}.json`, "utf-8")
		const questionSet = JSON.parse(data)
		return questionSet
	} catch (error) {
		throw new Error(`Failed to max topic ${topic}: ${error.message}`)
	}
}

export async function writeTopicToFile(topic, questionSet) {
	try {
		await fs.writeFile(
			`${TOPICS_DIR}/${topic}.json`,
			JSON.stringify(questionSet, null, 2)
		)
	} catch (error) {
		throw new Error(`Failed to save topic ${topic}: ${error.message}`)
	}
}
