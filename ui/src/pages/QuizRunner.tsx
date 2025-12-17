// @ts-nocheck

import { millisecondsToMinsSecs } from "@/lib/helpers.ts"

import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router"
import {
	loadSession,
	saveSession,
	saveLiveSession,
} from "@/services/storage.js"
import {
	completeSession,
	checkAnswer,
	createSession,
} from "@/services/quizEngine.js"
import {
	GraduationCap,
	SendHorizontal,
	CheckCircle2Icon,
	CircleX,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast, Toaster } from "sonner"
import { useRef } from "react"
import ErrorBox from "@/components/ErrorBox"

const QuizRunner = ({ debug = true }) => {
	const { sessionId } = useParams()
	const navigate = useNavigate()
	const [isLoading, setIsLoading] = useState(true)
	const [session, setSession] = useState(null)
	const [error, setError] = useState(null)
	const prevSessionRef = useRef(session)

	useEffect(() => {
		const load = async () => {
			setIsLoading(true)
			const loadedSession = await loadSession(sessionId)
			if (!loadedSession) {
				console.error("Session not found")
				navigate(`/`)
				return
			}

			if (
				loadedSession.status === "inProgress" &&
				!loadedSession.questionStartedAt
			)
				loadedSession.questionStartedAt = Date.now()

			setSession(loadedSession)
			setIsLoading(false)
		}
		load()
	}, [sessionId, navigate])

	useEffect(() => {
		if (!session) return

		const prevStatus = prevSessionRef.current?.status
		const currentStatus = session.status

		console.log("prevStatus:", prevStatus, "currentStatus:", currentStatus)

		// check if status has changed, e.g. from draft to inProgress
		if (prevStatus && prevStatus !== currentStatus) {
			if (currentStatus === "inProgress") {
				// Persist session when quiz starts & enters inProgress
				const persist = async () => {
					try {
						await saveSession(session.id, session)
					} catch (err) {
						setError(`Failed to start quiz: ${err}`)
						console.error(err)
					}
				}
				persist()
			} else if (currentStatus === "complete") {
				// Complete session (& persist) when quiz ends
				const complete = async () => {
					try {
						await completeSession(session)
						// a message / animation indicating finish + calculating...
					} catch (err) {
						setError(`Failed to complete quiz: ${err}`)
						console.error(err)
					}
				}
				complete()
			}
		}

		if (currentStatus === "inProgress") {
			console.log("saving live session...")
			try {
				saveLiveSession(session)
			} catch (err) {
				setError(`Failed to save quiz progress: ${err}`)
				console.error(err)
			}
		}
		prevSessionRef.current = session
	}, [session])

	if (isLoading) return <div>Loading....</div>
	if (!session) return <div>Session not found.</div>
	return (
		<div className="px-10">
			<Toaster position="top-center" expand={true} richColors />
			{error ? <ErrorBox errorTitle="Quiz error." error={error} /> : null}

			<h1>Quiz</h1>

			{session.status === "draft" && (
				<QuizStart {...{ session, setSession, setError }} />
			)}
			{session.status === "inProgress" && (
				<QuizInProgress {...{ session, setSession, setError }} />
			)}
			{session.status === "complete" && (
				<QuizComplete {...{ session, setError }} />
			)}
			<br />
			<br />
			<div className="bg-gray-50 max-w-lg">
				{debug && (
					<details>
						<summary>`session` object</summary>
						<pre className="text-xs whitespace-pre-wrap">
							{JSON.stringify(session, null, 2)}
						</pre>
					</details>
				)}
			</div>
		</div>
	)
}

const QuizStart = ({ session, setSession, setError }) => {
	const handleStart = async () => {
		setSession((prev) => ({
			...prev,
			questionStartedAt: Date.now(),
			status: "inProgress",
		}))
	}

	return (
		<div>
			<h2>Quiz Start</h2>
			<Button onClick={handleStart} className="mr-2">
				<GraduationCap className="mr-2" />
				Start quiz
			</Button>
			Status: {JSON.stringify(session.status)}
		</div>
	)
}

const QuizInProgress = ({ session, setSession, setError }) => {
	const { questionIndex, questions } = session
	const currentQuestion = questions[questionIndex] || {}

	const updateSessionState = (
		prevSession,
		questionAttempt,
		isCorrect,
		isSkip = false
	) => {
		// map over questions, find updated question(s) to be updated and increment counts
		const updatedQuestions = prevSession.questions.map((q, index) =>
			index === prevSession.questionIndex
				? {
						...q,
						attempts: [...q.attempts, questionAttempt],
						attemptCount: isSkip
							? q.attemptCount
							: q.attemptCount + 1,
						correctCount: isCorrect
							? q.correctCount + 1
							: q.correctCount,
						skippedCount: isSkip
							? q.skippedCount + 1
							: q.skippedCount,
						updatedAt: new Date(),
				  }
				: q
		)

		const newIndex = prevSession.questionIndex + 1

		return {
			...prevSession,
			questions: updatedQuestions,
			questionIndex: newIndex,
			questionStartedAt: Date.now(),
			status:
				newIndex >= prevSession.questions.length
					? "complete"
					: prevSession.status,
			updatedAt: new Date().toISOString(),
			correct: isCorrect ? prevSession.correct + 1 : prevSession.correct,
			attempted: isSkip
				? prevSession.attempted
				: prevSession.attempted + 1,
			skipped: isSkip ? prevSession.skipped + 1 : prevSession.skipped,
		}
	}

	const handleAnswer = (userAnswer) => {
		const { questionAttempt, isCorrect } = checkAnswer(
			currentQuestion,
			userAnswer
		)

		const notify = isCorrect ? toast.success : toast.error
		notify(isCorrect ? "✅ Correct!" : "❌ Wrong.", {
			description: `Answers: ${currentQuestion.answers.join(", ")}`,
		})

		questionAttempt.answerTime = Date.now() - session.questionStartedAt
		setSession((prev) => {
			return updateSessionState(prev, questionAttempt, isCorrect)
		})
	}

	const handleSkip = () => {
		const isCorrect = false
		const questionAttempt = {
			userAnswer: null,
			isCorrect: false,
			isSkipped: true,
			createdAt: new Date().toISOString(),
		}
		questionAttempt.answerTime = Date.now() - session.questionStartedAt
		setSession((prev) => {
			return updateSessionState(prev, questionAttempt, isCorrect, true)
		})
	}

	return (
		<div>
			<h2>QuizInProgress</h2>
			{questionIndex < questions.length ? (
				<div className="flex flex-col items-center">
					<QuestionPrompt {...{ currentQuestion }} />
					<AnswerBox {...{ handleAnswer }} key={currentQuestion.id} />
					<Button onClick={handleSkip} variant="outline">
						Skip
					</Button>
					<Timer start={session.questionStartedAt} />
				</div>
			) : (
				<p>No more questions.</p>
			)}

			<br />
			<p>Status: {JSON.stringify(session.status)}</p>
		</div>
	)
}

const QuizComplete = ({ session, setError }) => {
	const navigate = useNavigate()
	const handleNavigate = (url) => {
		return () => {
			navigate(url)
		}
	}

	const handleCreateSession = async (e) => {
		e.preventDefault()
		setError(null)
		try {
			const { title, description, difficulty, grade, quizId, questions } =
				session

			// const cleanedQuestions = questions.map((q) => {
			// 	const { attemptCount, correctCount, ...cleanQuestion } = q
			// 	return cleanQuestion
			// })

			const questionSet = {
				title,
				description,
				difficulty,
				grade,
				questions,
			}

			const config = {
				enableGenerate: false,
				newQuestionCount: 0,
				quizRunQuestionCount: questions.length,
				questionMix: "existing",
				quizId,
				mode: "existing",
			}

			const sessionId = await createSession(questionSet, config)

			if (sessionId) {
				navigate(`/quiz/play/${sessionId}`)
			} else {
				setError("Failed to create session.")
			}
		} catch (error) {
			console.error("Failed to create session:", error)
			setError(error.message || "Error occurred while creating session.")
		}
	}

	return (
		// [&>*]:border [&>*]:border-red-500 [&>*>*]:border [&>*>*]:border-red-500
		<div className="space-y-4 ">
			<h2>Quiz Complete 🥳</h2>

			<div className="flex flex-col w-sm gap-2 m-auto mb-10">
				<Button
					onClick={handleNavigate(`/quiz/compose/${session.quizId}`)}
				>
					Generate more
				</Button>

				<Button variant="outline" onClick={handleCreateSession}>
					Retake
				</Button>
				<Button variant="outline" onClick={handleNavigate(`/compose`)}>
					Create a new topic
				</Button>
			</div>
			<hr className="" />
			<p>Here's how you did:</p>

			<div className="mx-auto max-w-75 space-y-4 text-center bg-blue-100 shadow-md rounded-sm">
				<p className="text-5xl font-bold mb-0">
					{session.attempted > 0
						? Math.round(
								(100 * session.correct) / session.attempted
						  )
						: 0}
					%
				</p>
				<table className="mx-auto border-separate border-spacing-4 text-left mb-0">
					<tbody>
						<tr>
							<th scope="row" className="font-bold">
								Attempted
							</th>
							<td>{session.attempted}</td>
						</tr>
						<tr>
							<th scope="row" className="font-bold">
								Correct
							</th>
							<td>{session.correct}</td>
						</tr>
						<tr>
							<th scope="row" className="font-bold">
								Wrong
							</th>
							<td>{session.attempted - session.correct}</td>
						</tr>
					</tbody>
				</table>
				<p className="font-light italic">
					{new Date(session.updatedAt).toLocaleString()}
				</p>
			</div>
			<h3 className="mt-10">Your answers</h3>
			{session.questions.map((q) => {
				const isCorrect = q.attempts.at(-1).isCorrect
				return (
					<div key={q.id}>
						{/* prompt, answers, userAnswer, isCorrect */}
						<p className="font-semibold mb-0">{q.prompt}</p>
						<div className="flex justify-between mb-0">
							<span
								className={
									(isCorrect
										? "text-green-500"
										: "text-red-500") +
									" inline-flex items-center gap-1"
								}
							>
								{isCorrect ? <CheckCircle2Icon /> : <CircleX />}
								{q.attempts.at(-1).userAnswer || "(skipped)"}
							</span>
							<span className="ml-5 text-sm">
								All-time score:{" "}
								{q.attemptCount > 0
									? Math.round(
											(100 * q.correctCount) /
												q.attemptCount
									  )
									: 0}
								%
							</span>
						</div>
						<p className="mb-3">Answers: {q.answers.join(", ")}</p>
					</div>
				)
			})}
		</div>
	)
}

const QuestionPrompt = ({ currentQuestion }) => {
	return (
		<p>
			<b>{currentQuestion.prompt}</b>
		</p>
	)
}

const AnswerBox = ({ handleAnswer }) => {
	const [userAnswer, setUserAnswer] = useState("")
	const [isLocked, setIsLocked] = useState(false)

	const handleSubmit = (e) => {
		e.preventDefault()

		if (!userAnswer.trim() || isLocked) return
		setIsLocked(true)
		handleAnswer(userAnswer)
		setUserAnswer("")
		setIsLocked(false)
	}

	return (
		<div>
			<form
				className="flex items-center gap-1 bg-gray-50 p-3 rounded w-100"
				onSubmit={handleSubmit}
			>
				<Input
					name="userAnswer"
					className="w-100 bg-white"
					id="userAnswer"
					placeholder="Answer goes here..."
					value={userAnswer}
					onChange={(e) => setUserAnswer(e.target.value)}
					disabled={isLocked}
				/>
				<Button className="" type="submit" disabled={isLocked}>
					<SendHorizontal />
				</Button>
			</form>
		</div>
	)
}

const Timer = ({ start }) => {
	const [elapsed, setElapsed] = useState(0)

	useEffect(() => {
		const interval = setInterval(() => {
			setElapsed(Date.now() - start)
		}, 100)
		return () => clearInterval(interval)
	}, [start])

	return (
		<span className="ml-2 text-sm font-mono">
			{millisecondsToMinsSecs(elapsed)}
		</span>
	)
}

export default QuizRunner
