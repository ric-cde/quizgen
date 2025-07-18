// User responses
export const POSITIVE_RESPONSES = ["y", "yes", "ya", "sure", "ok"]

// File paths
export const TOPICS_DIR = "./topics"

// Quiz config
export const QUIZ_DEFAULTS = {
	MIN_QUESTIONS: 1,
	COUNTDOWN_DELAY: 500,
}

// Countdown
export const COUNTDOWN_CONFIG = {
	MESSAGE: "\nQuiz round starting...",
	PHRASES: ["Ready, ", "steady", "go!\n"],
}

// Error messages
export const ERROR_MESSAGES = {
	NO_QUESTIONS: "No questions found.",
	TOPIC_NOT_FOUND: "Topic not found. Try again.",
	INVALID_TOPIC_NAME: "Invalid topic name. Please use only letters.",
	TOPIC_EXISTS: "Topic already exists. Try another.",
	LOAD_TOPICS_FAILED: "Could not load topics.",
	NO_TOPICS_AVAILABLE: "No topics found.",
}

// Success messages
export const SUCCESS_MESSAGES = {
	TOPICS_LOADED: "Topics loaded.\n",
	WELCOME: "Welcome to quiz generator! \n",
	TOPIC_ADDED: (topic) => `${topic} added to library.`,
	CORRECT_ANSWER: "Correct!\n",
	WRONG_ANSWER: "Wrong. :(\n",
}

// Prompts
export const PROMPTS = {
	TOPIC_SELECTION: "Which one would you like to test your mettle on? \n",
	CUSTOM_TOPIC: "What custom topic would you like? ",
	QUESTION_COUNT: (max) =>
		`How many questions would you like to answer? Max: (${max}) \n`,
	REPLAY: "Would you like to play another round? [y] or [n] ",
	QUESTION_ANSWER: (prompt) => `${prompt} `,
}

// Quiz session defaults
export const CUSTOM_TOPIC_TEMPLATE = {
	desc: "Custom questions.",
	questions: [
		{
			prompt: "sample custom question?",
			answers: ["yes", "no"],
		},
		{
			prompt: "another sample?",
			answers: ["yes", "no"],
		},
	],
}
