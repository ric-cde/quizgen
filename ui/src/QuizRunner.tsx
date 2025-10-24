// @ts-nocheck

import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router"
import { loadSession } from "@/services/storage.js"

const QuizRunner = () => {
	const { sessionId } = useParams()
	const navigate = useNavigate()
	const [isLoading, setIsLoading] = useState(true)
	const [session, setSession] = useState(null)

	useEffect(() => {
		const load = async () => {
			const loadedSession = await loadSession(sessionId)
			if (!loadedSession) {
				console.error("Session not found")
				navigate(`/`)
				return
			}
			setSession(loadedSession)
			setIsLoading(false)
		}
		load()
	}, [sessionId])

	if (isLoading) return <div>Loading....</div>
	if (!session) return <div>Session not found.</div>
	return (
		<div>
			<h1>Take a quiz</h1>

			<div className="bg-gray-50 max-w-sm">
				<h3 className="text-3xl">Debugger</h3>
				<pre className="text-xs">
					{JSON.stringify(location.state, null, 2)}
				</pre>
			</div>
		</div>
	)
}

export default QuizRunner
