// @ts-nocheck
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { useState, useEffect, useRef } from "react"
import { useNavigate, Link } from "react-router"
import { loadTopics, deleteTopic } from "@/services/storage.js"
import { CircleQuestionMark, Trash2, Dices } from "lucide-react"
import ErrorBox from "@/components/ErrorBox"

const Home = () => {
	return (
		<>
			<div className="min-h-[50vh] flex flex-col justify-around bg-gray-100 pb-4 rounded-2xl">
				<h1 className="text-center text-6xl font-extrabold mt-10 mb-0">
					Quiz Generator
				</h1>
				<h3 className="text-center my-0">
					Challenge yourself on any topic{" "}
				</h3>
				<TopicQuickStart />
			</div>
			<ExistingQuizList />
		</>
	)
}

const TopicQuickStart = () => {
	const [topic, setTopic] = useState("")
	const navigate = useNavigate()
	const inputRef = useRef(null)

	const handleSubmit = (e) => {
		e.preventDefault()
		const value = topic.trim()
		if (!value) return
		navigate(`/compose?title=${encodeURIComponent(value)}`)
	}
	return (
		<>
			<form
				className="mx-auto sm:w-[640px] flex justify-center items-center gap-3 py-3 bg-background rounded-3xl border border-transparent focus-within:border-primary/50 focus-within:ring-2 focus-within:ring-ring cursor-text "
				onSubmit={handleSubmit}
				onClick={() => inputRef.current?.focus()}
			>
				<Input
					ref={inputRef}
					type="text"
					placeholder="Enter a topic (e.g. French history)"
					value={topic}
					onChange={(e) => setTopic(e.target.value)}
					className="md:text-lg w-full h-14 pl-5 border-0 shadow-none bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0"
				/>
				<Button
					className="h-14 px-5 w-max mr-5 rounded-xl"
					type="submit"
					aria-label="Generate quiz"
					title="Generate quiz"
				>
					<Dices className="size-6" />
				</Button>
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
					<Trash2 />
				</Button>
			</div>
			<hr className="col-span-2" />
		</>
	)
}

export default Home
