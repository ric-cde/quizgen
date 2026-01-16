// @ts-nocheck
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { useState, useEffect } from "react"
import { useNavigate, Link } from "react-router"
import { loadTopics, deleteTopic } from "@/services/storage.js"
import { CircleQuestionMark } from "lucide-react"
import ErrorBox from "@/components/ErrorBox"

const Home = () => {
	return (
		<div>
			<h1>Quiz Generator</h1>
			<h3>Challenge yourself on any topic </h3>
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
				<Input
					type="text"
					placeholder="Enter a topic (e.g. French history)"
					value={topic}
					onChange={(e) => setTopic(e.target.value)}
					className="ml-5 w-75 p-2 bg-white mr-2"
				/>
				<Button type="submit">Configure quiz</Button>
			</form>
		</>
	)
}

const ExistingQuizList = () => {
	const [topics, setTopics] = useState([])
	const [isLoading, setIsLoading] = useState(true)
	const [error, setError] = useState(null)

	useEffect(() => {
		const load = async () => {
			setIsLoading(true)
			setError(null)
			try {
				const loadedTopics = await loadTopics()
				setTopics(loadedTopics || [])
			} catch (err) {
				console.error("Failed to load topics:", err)
				setError("Failed to load topics. Please try again.")
			} finally {
				setIsLoading(false)
			}
		}

		load()
	}, [])

	const handleDelete = async (quizId) => {
		setError(null)
		try {
			await deleteTopic(quizId)

			setTopics((prev) => prev.filter((t) => t.id !== quizId))
		} catch (err) {
			console.error(`Failed to delete topic: ${err}`)
			setError(`Failed to delete topic. Please try again.`)
			return
		}
	}

	if (isLoading) {
		return <>Loading...</>
	} else {
		return (
			<>
				<h3>Your Topics</h3>
				{error ? <ErrorBox errorTitle="Error" error={error} /> : null}
				<div className="grid grid-cols-[1fr_auto] gap-2 gap-y-1 px-5">
					{topics.length > 0
						? topics.map((t) => (
								<ExistingQuiz
									key={t.id}
									topic={t}
									{...{ handleDelete }}
								/>
							))
						: "You haven't generated any quizzes yet."}
				</div>
			</>
		)
	}
}

const ExistingQuiz = ({ topic, handleDelete }) => {
	const navigate = useNavigate()
	const handleEdit = (e) => {
		e.preventDefault()
		navigate(`/quiz/compose/${topic.id}`)
	}
	const handleDeleteClick = (e) => {
		e.preventDefault()
		handleDelete(topic.id)
	}

	return (
		<>
			<div className="flex items-center">
				<div>
					<Link to={`quiz/view/${topic.id}`}>
						<strong>{topic.title} </strong>
					</Link>
					<Badge
						variant="outline"
						className="ml-1 h-7 min-w-7 px-2 font-mono"
					>
						<CircleQuestionMark />
						{topic.count}&nbsp;
					</Badge>
				</div>
			</div>
			<div className="flex items-center gap-2 m-auto">
				<Button
					className="text-xs"
					variant="outline"
					onClick={handleEdit}
				>
					New Session
				</Button>
				<Button
					className="text-xs"
					variant="destructive"
					onClick={handleDeleteClick}
				>
					Delete
				</Button>
			</div>
			<hr className="col-span-2" />
		</>
	)
}

export default Home
