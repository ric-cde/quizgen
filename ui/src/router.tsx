import Home from "./Home.tsx"
import QuizComposer from "./QuizComposer.tsx"
import QuizRunner from "./QuizRunner.tsx"
import Layout from "./components/Layout.tsx"
import { Routes, Route, useParams } from "react-router"

const AppRouter = () => (
	<Routes>
		<Route path="/" element={<Layout />}>
			<Route index element={<Home />} />
			<Route path="compose" element={<ComposeNewPage />} />
			<Route path="quiz/play" element={<QuizRunner />} />
			<Route
				path="quiz/:quizId/compose"
				element={<ComposeExistingPage />}
			/>
			<Route path="quiz/:quizId/edit" element={<EditExistingPage />} />
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

const EditExistingPage = () => {
	const { quizId } = useParams()
	return <QuizEditor quizId={quizId} />
}

const QuizEditor = ({ quizId }) => {
	return <>{quizId}</>
}

export default AppRouter
