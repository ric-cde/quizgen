import fs from "fs/promises"
import path from "path"

export async function loadTopicNames() {
	const files = await fs.readdir("./topics")
	return files
		.filter((file) => path.extname(file) === ".json")
		.map((file) => path.parse(file).name)
}

export async function loadTopicFromFile(topic) {
	const data = await fs.readFile(`./topics/${topic}.json`, "utf-8")
	const questionSet = await JSON.parse(data)
	return questionSet
}

export async function writeTopicToFile(topic, questionSet) {
	fs.writeFile(`./topics/${topic}.json`, JSON.stringify(questionSet, null, 2))
}
