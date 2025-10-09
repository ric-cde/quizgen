import fs from "fs/promises"
import path from "path"
import { TOPICS_DIR } from "../utils/constants.js"

export async function loadTopicNames() {
	const files = await fs.readdir(TOPICS_DIR)
	const filteredFiles = files.filter((file) => path.extname(file) === ".json")
	const listOfFiles = await Promise.all(
		filteredFiles.map(async (file) => {
			try {
				const data = await fs.readFile(
					path.join(TOPICS_DIR, file),
					"utf-8"
				)

				const { topic, slug } = JSON.parse(data)

				if (slug) {
					return { topic, slug }
				} else {
					console.log(
						`Error: Topic ${topic} (${file}) has no slug. Skipping...`
					)
					return null
				}
			} catch (err) {
				console.error(`Failed to load ${file}: ${err.message}`)
				return null
			}
		})
	)

	// remove nulls
	return listOfFiles.filter((f) => f)
}

export async function loadQuestionSetFromFile(slug) {
	try {
		const data = await fs.readFile(
			path.join(TOPICS_DIR, `${slug}.json`),
			"utf-8"
		)
		const questionSet = JSON.parse(data)
		return questionSet
	} catch (error) {
		throw new Error(`Failed to load topic ${slug}: ${error.message}`)
	}
}

export async function writeQuestionSetToFile(slug, questionSet) {
	try {
		await fs.writeFile(
			`${TOPICS_DIR}/${slug}.json`,
			JSON.stringify(questionSet, null, 2)
		)
	} catch (error) {
		throw new Error(`Failed to save topic ${slug}: ${error.message}`)
	}
}
