// @ts-nocheck
import { Button } from "./components/ui/button"
import { useState } from "react"
import { useNavigate } from "react-router"

const Home = () => {
	return (
		<div>
			<h1>Quiz Generator</h1>
			<h3>Craft a quiz on any topic </h3>
			<TopicQuickStart />
			<ExistingQuizList />
		</div>
	)
}

const TopicQuickStart = () => {
	const [topic, setTopic] = useState("")
	const navigate = useNavigate()

	const handleSubmit = (e) => {
		e.preventDefault()
		const value = topic.trim()
		if (!value) return
		navigate(`/compose?title=${encodeURIComponent(value)}`)
	}
	return (
		<>
			<form onSubmit={handleSubmit}>
				<input
					type="text"
					placeholder="Enter a topic (e.g. French history)"
					value={topic}
					onChange={(e) => setTopic(e.target.value)}
				/>
				<Button type="submit">Generate quiz</Button>
			</form>
		</>
	)
}

const ExistingQuizList = () => {
	return (
		<>
			ExistingQuizList. <br />
			<ExistingQuiz />
		</>
	)
}

const ExistingQuiz = () => "<ExistingQuiz> item"

export default Home
