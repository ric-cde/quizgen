// @ts-nocheck

import { useEffect, useState } from "react"
import { Link } from "react-router"
import { loadQuizSessions, loadQuestionBank } from "@/services/storage.js"
import { Badge } from "@/components/ui/badge"
import { Card, CardHeader, CardFooter, CardTitle } from "@/components/ui/card"
import ErrorBox from "@/components/ErrorBox"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircleIcon, CircleQuestionMark } from "lucide-react"
import { millisecondsToMinsSecs } from "@/lib/helpers.ts"

const QuizViewer = ({ quizId }) => {
	const [isLoading, setIsLoading] = useState(true)
	const [sessions, setSessions] = useState(null)
	const [error, setError] = useState(null)
	const [questionBank, setQuestionBank] = useState(null)

	const debug = true

	useEffect(() => {
		// load bank and sessions
		const load = async () => {
			setIsLoading(true)
			setError(null)
			try {
				const [loadedQuestionBank, loadedQuizSessions] =
					await Promise.all([
						loadQuestionBank(quizId),
						loadQuizSessions(quizId),
					])

				setQuestionBank(loadedQuestionBank)
				setSessions(loadedQuizSessions)
			} catch (err) {
				console.error(`Failed to load data: ${err}`)
				setError(`Failed to load data: ${err.message || err}`)
			}

			setIsLoading(false)
		}
		load()
	}, [quizId])

	if (isLoading) return <div>Loading....</div>
	if (!sessions || !questionBank) return <div>Quiz not found.</div>

	return (
		<>
			{error ? <ErrorBox errorTitle="Error" error={error} /> : null}
			<h1>{questionBank.title}</h1>
			<InProgressAlert {...{ sessions }} />
			<StatsList {...{ sessions, questionBank, debug }} />

			<SessionsList {...{ sessions, debug }} />

			<QuestionList {...{ questionBank, debug }} />
		</>
	)
}

const StatsList = ({ sessions, questionBank, debug }) => {
	const defaults = {
		completed: 0,
		attempted: 0,
		correct: 0,
		skipped: 0,
		averageAnswerTime: 0,
		correctPercent: 0,
		worstQuestion: {},
	}
	const [stats, setStats] = useState(defaults)

	useEffect(() => {
		// calculate stats
		const sessionsCalculated = sessions.reduce(
			(acc, s) => {
				if (s.status === "complete") {
					acc.completed += 1
				}
				acc.attempted += s.attempted || 0
				acc.correct += s.correct || 0
				acc.skipped += s.skipped || 0
				return acc
			},
			{
				completed: 0,
				attempted: 0,
				correct: 0,
				skipped: 0,
			}
		)

		const { worstQuestion, answerTiming } = questionBank.questions.reduce(
			(acc, q) => {
				const wrong = q.attemptCount - q.correctCount
				const correctRate =
					q.attemptCount > 0 ? q.correctCount / q.attemptCount : 0
				if (
					wrong > acc.worstQuestion.incorrect ||
					(wrong === acc.worstQuestion.incorrect &&
						correctRate < acc.correctRate)
				) {
					acc.worstQuestion = {
						incorrect: wrong,
						correctRate,
						prompt: q.prompt,
					}
				}

				const [answerTime, relevantAnswerCount] = q.attempts.reduce(
					(acc, a) => {
						if (a.answerTime > 0) {
							acc[0] += a.answerTime
							acc[1]++
						}
						return acc
					},
					[0, 0]
				)

				if (relevantAnswerCount > 0) {
					acc.answerTiming.totalTime += answerTime || 0
					acc.answerTiming.totalRelevantAnswers += relevantAnswerCount
				}
				return acc
			},
			{
				worstQuestion: {
					incorrect: -1,
					correctRate: 1,
					prompt: "",
				},
				answerTiming: { totalTime: 0, totalRelevantAnswers: 0 },
			}
		)

		sessionsCalculated.worstQuestion = worstQuestion
		sessionsCalculated.averageAnswerTime =
			answerTiming.totalTime / answerTiming.totalRelevantAnswers || 0

		setStats((prev) => ({
			...prev,
			...sessionsCalculated,
			correctPercent:
				sessionsCalculated.attempted > 0
					? Math.round(
							(100 * sessionsCalculated.correct) /
								sessionsCalculated.attempted
					  )
					: 0,
		}))
	}, [sessions, questionBank])

	return (
		<>
			<h2>Statistics</h2>
			<div className="flex flex-wrap gap-2">
				<StatBox label="Sessions completed" stat={stats.completed} />
				<StatBox label="Questions attempted" stat={stats.attempted} />
				<StatBox label="Correct answers" stat={stats.correct} />
				<StatBox label="% correct" stat={stats.correctPercent + "%"} />
				<StatBox
					label="Skipped questions"
					stat={stats.skipped}
					className=" bg-red-300"
				/>
				<StatBox
					label="Average answer time"
					stat={millisecondsToMinsSecs(stats.averageAnswerTime)}
				/>
				<StatBox
					label="Weakest question"
					stat={stats.worstQuestion?.prompt || "N/A"}
					titleClassName="text-xl"
					className="basis-full bg-red-300"
				/>
			</div>
			{debug && (
				<details>
					<summary>`stats` object</summary>
					<pre className="text-xs whitespace-pre-wrap">
						{JSON.stringify(stats, null, 2)}
					</pre>
				</details>
			)}
		</>
	)
}

const StatBox = ({ stat, label, className = "", titleClassName = "" }) => (
	<div
		className={`bg-blue-300 rounded-xs p-2 shadow-sm flex-1 min-w-40 ${className}`}
	>
		<h3 className={`text-6xl font-bold mb-2 text-center ${titleClassName}`}>
			{stat}
		</h3>
		<p className="text-center text-sm">{label}</p>
	</div>
)

const SessionsList = ({ sessions, debug }) => {
	return (
		<>
			<h2>Your sessions</h2>

			<div className="grid grid-cols-6 gap-2 gap-y-1 px-5">
				{sessions.length > 0
					? sessions.map((s) => (
							<SessionItem key={s.id} session={s} />
					  ))
					: "No sessions found."}
			</div>

			{debug && (
				<details>
					<summary>`stats` object</summary>
					<pre className="text-xs whitespace-pre-wrap">
						{JSON.stringify(sessions, null, 2)}
					</pre>
				</details>
			)}
		</>
	)
}

const SessionItem = ({ session }) => {
	const getStatusColor = () => {
		if (session.status === "draft")
			return "bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-100"
		if (session.status === "inProgress")
			return "bg-blue-100 text-blue-600 border-blue-200"
		if (session.status === "complete")
			return "bg-emerald-100 text-emerald-600 border-emerald-200"
	}

	const score = session.attempted
		? Math.floor((100 * session.correct) / session.attempted)
		: 0

	return (
		<>
			<div className="flex items-center py-2 pl-2">
				<Link
					to={`/quiz/play/${session.id}`}
					className="font-mono text-sm font-semibold text-slate-700 hover:text-blue-600 transition-colors"
				>
					<span className="text-slate-300 mr-1">#</span>
					{session.id}
				</Link>
			</div>

			<div className="flex items-center">
				<Badge
					variant="outline"
					className="ml-1 h-7 min-w-7 px-2 font-mono"
				>
					<div className="text-sm text-slate-600 font-medium">
						{session.attempted || 0}
						<span className="text-slate-300 mx-1">/</span>
						{session.questions.length}
					</div>
					<CircleQuestionMark />
				</Badge>
			</div>

			<div className="flex items-center">
				<span
					className={`text-sm font-bold ${
						score >= 80
							? "text-emerald-600"
							: score >= 50
							? "text-amber-600"
							: "text-red-500"
					}`}
				>
					{session.attempted > 0 ? score + "%" : ""}
				</span>
			</div>

			<div className="flex items-center text-sm text-slate-500">
				{session.createdAt &&
					new Date(session.createdAt).toLocaleDateString(undefined, {
						month: "short",
						day: "numeric",
						year: "numeric",
					})}
			</div>

			<div className="flex items-center">
				<Badge
					variant="outline"
					className={`px-2 h-6 min-w-7 font-normal capitalize ${getStatusColor()}`}
				>
					{session.status.replace(/([A-Z])/g, " $1")}
				</Badge>
			</div>

			<div className="flex items-center justify-end pr-2">
				<Button
					size="sm"
					variant="outline"
					className="text-xs h-8 hover:text-blue-600"
				>
					<Link to={`/quiz/play/${session.id}`}>View Session</Link>
				</Button>
			</div>
			<hr className="col-span-6 " />
		</>
	)
}

const QuestionList = ({ questionBank, debug }) => {
	const questions = questionBank.questions
	return (
		<>
			<h2>Your questions</h2>
			<div className="flex flex-col gap-4">
				{questions.length > 0
					? questions.map((q) => (
							<QuestionItem key={q.id} question={q} />
					  ))
					: "No questions found."}
			</div>
			{debug && (
				<details>
					<summary>`questionBank` object</summary>
					<pre className="text-xs whitespace-pre-wrap">
						{JSON.stringify(questionBank, null, 2)}
					</pre>
				</details>
			)}
		</>
	)
}

const QuestionItem = ({ question }) => {
	const { prompt, correctCount, attemptCount, updatedAt } = question
	const success =
		attemptCount > 0 ? Math.floor(100 * (correctCount / attemptCount)) : 0

	const getDifficultyColor = () => {
		if (question.difficulty === "Easy") return "bg-green-100 text-green-700"
		if (question.difficulty === "Med")
			return " bg-orange-100 text-orange-700"
		if (question.difficulty === "Hard") return "bg-red-100 text-red-700"
	}

	return (
		<>
			<Card className="flex flex-row items-stretch p-0 gap-0 overflow-hidden">
				<div className="flex flex-col grow pt-3">
					<CardHeader>
						<CardTitle className="text-md font-medium leading-normal">
							{prompt}
						</CardTitle>
					</CardHeader>
					<CardFooter className="mt-auto pb-2 justify-between items-end">
						<p className="text-sm text-muted-foreground m-0  leading-tight">
							{new Date(updatedAt).toLocaleDateString(undefined, {
								month: "short",
								day: "numeric",
								year: "numeric",
							})}
						</p>

						<Badge
							variant="outline"
							className={`px-2 h-6 min-w-15 font-normal capitalize ${getDifficultyColor()}`}
						>
							{question.difficulty.replace(/([A-Z])/g, " $1")}
						</Badge>

						<p className="m-0 leading-tight">
							<span className="text-sm font-bold">
								{attemptCount}{" "}
							</span>
							<span className="text-xs text-muted-foreground font-medium uppercase">
								Attempts
							</span>
						</p>
					</CardFooter>
				</div>
				<div className="flex flex-col items-center justify-center min-w-32 bg-slate-100 border-1">
					<span className="text-2xl font-bold">{success}%</span>
					<span className="text-xs text-muted-foreground font-medium uppercase mt-1">
						Correct
					</span>
				</div>
			</Card>
		</>
	)
}

const InProgressAlert = ({ sessions }) => {
	const sessionsInProgress = sessions.filter((s) => s.status === "inProgress")
	if (sessionsInProgress.length === 0) return null

	return (
		<Alert variant="default">
			<AlertCircleIcon />
			<AlertTitle>In Progress</AlertTitle>
			<AlertDescription>
				You have{" "}
				{sessionsInProgress.length > 1 ? "sessions" : "a session"} in
				progress for this quiz:
				<ul>
					{sessionsInProgress.map((s) => {
						const updatedAt = new Date(s.updatedAt)
						return (
							<li className="ml-5" key={s.id}>
								<Link
									className="font-semibold"
									to={`/quiz/play/${s.id}`}
								>
									{new Intl.DateTimeFormat("en-GB", {
										dateStyle: "medium",
										timeStyle: "short",
									}).format(updatedAt)}
								</Link>
							</li>
						)
					})}
				</ul>
			</AlertDescription>
		</Alert>
	)
}

export default QuizViewer
