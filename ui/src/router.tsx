import Home from "@/pages/Home.tsx"
import QuizComposer from "@/pages/QuizComposer.tsx"
import QuizRunner from "@/pages/QuizRunner.tsx"
import Layout from "@/layouts/Layout.tsx"
import { Routes, Route, useParams } from "react-router"
import QuizViewer from "./pages/QuizViewer"

const AppRouter = () => (
	<Routes>
		<Route path="/" element={<Layout />}>
			<Route index element={<Home />} />
			<Route path="compose" element={<ComposeNewPage />} />
			<Route path="quiz/play/:sessionId/" element={<QuizRunner />} />
			<Route
				path="quiz/compose/:quizId"
				element={<ComposeExistingPage />}
			/>
			<Route path="quiz/view/:quizId" element={<ViewExistingPage />} />
		</Route>
	</Routes>
)

const ComposeNewPage = () => {
	return <QuizComposer mode="new" quizId={null} />
}

const ComposeExistingPage = () => {
	const { quizId } = useParams()
	return <QuizComposer mode="existing" quizId={quizId} />
}

const ViewExistingPage = () => {
	const { quizId } = useParams()
	return <QuizViewer quizId={quizId} />
}

export default AppRouter
