// User responses
export const POSITIVE_RESPONSES = ["y", "yes", "ya", "sure", "ok"]

// File paths
export const TOPICS_DIR = "./src/topics"

// Quiz config
export const QUIZ_DEFAULTS = {
	MIN_QUESTIONS: 1,
	MAX_QUESTIONS: 10,
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
	TOPIC_NOT_FOUND:
		"Topic not found. Enter an existing topic from the list or choose [custom].",
	INVALID_TOPIC_NAME: "Invalid topic name. Please use only letters.",

	LOAD_TOPICS_FAILED: "Could not load topics.",
	NO_TOPICS_AVAILABLE: "No topics found.",
}

// Success messages
export const SUCCESS_MESSAGES = {
	TOPICS_LOADED: "Topics loaded.\n",
	WELCOME: "Welcome to quiz generator! \n",
	TOPIC_ADDED: (topic) => `${topic} added to library.`,
}

// Prompts
export const PROMPTS = {
	TOPIC_SELECTION: "Which one would you like to test your mettle on?\n",
	TOPIC_EXISTS: "Use [existing] questions or generate [new] questions?\n",
	CUSTOM_TOPIC: "What custom topic would you like?\n",
	QUESTION_COUNT: (max) =>
		`How many questions would you like? Max: (${max})\n`,
	REPLAY: `Play again? Choose [1] or [2]: \n
	[1] Same topic again. [2] Choose a different topic.\n`,
	QUESTION_ANSWER: (prompt) => `${prompt} `,
	QUESTION_DIFFICULTY: `How difficult should the questions be? Examples:\n
		* [entry-level], [easy], [beginner], [elementary school]\n
		* [intermediate], [skilled], [standard], [12th-grade]\n
		* [expert], [hard], [advanced], [PhD-level]\n`,
}
