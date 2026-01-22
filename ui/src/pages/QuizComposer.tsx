// @ts-nocheck

import { useSearchParams, useNavigate } from "react-router"
import { useState, useEffect, useContext, createContext } from "react"
import { useDebug } from "@/contexts/DebugContext"

import { QUIZ_DEFAULTS } from "@/lib/constants.js"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"
import ErrorBox from "@/components/ErrorBox"
import { Sparkles, GraduationCap } from "lucide-react"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { createSession } from "@/services/quizEngine.js"
import { loadQuestionBank } from "@/services/storage.js"

const QuizFormContext = createContext({
	quizFormState: {},
	handleChange: () => {},
	locked: {},
	mode: "new",
})

const QuizComposerPage = ({ quizId, mode }) => {
	const [params] = useSearchParams()
	const navigate = useNavigate()

	const getInitialState = () => {
		const initialState = {
			enableGenerate: true,
			newQuestionCount: QUIZ_DEFAULTS.NEW_QUESTIONS,
			questionMix: "new",
			quizType: QUIZ_DEFAULTS.QUIZ_TYPE,
		}
		if (mode === "new") {
			return {
				...initialState,
				quizId: null,
				title: params.get("title") || "",
				difficulty: QUIZ_DEFAULTS.DIFFICULTY,
				grade: QUIZ_DEFAULTS.GRADE,
				questions: [],
			}
		} else if (mode === "existing") {
			return {
				...initialState,
				quizRunQuestionCount: 5,
				quizId: quizId,
			}
		}
	}

	const [quizFormState, setQuizFormState] = useState(getInitialState)
	const [isLoading, setIsLoading] = useState(false)
	const [error, setError] = useState(null)

	useEffect(() => {
		if (mode === "existing" && quizId) {
			const load = async () => {
				setIsLoading(true)
				setError(null)
				try {
					const {
						title,
						description,
						difficulty,
						grade,
						quizType,
						questions,
					} = await loadQuestionBank(quizId)
					setQuizFormState((prev) => ({
						...prev,
						title,
						description,
						difficulty,
						grade,
						quizType,
						maxQuestions: questions.length + prev.newQuestionCount,
						questions,
					}))
				} catch (error) {
					console.error("Failed to load quiz:", error)
					setError("Failed to load quiz data.")
					navigate(`/compose`, { replace: true })
				} finally {
					setIsLoading(false)
				}
			}
			load()
		}
	}, [mode, quizId, navigate])

	const handleChange = (e) => {
		// Check if event change from an input
		if (e.target) {
			const { name, value, type, checked } = e.target
			const val = type === "checkbox" ? checked : value
			setQuizFormState((prev) => ({ ...prev, [name]: val }))
		} else {
			// plain object update
			setQuizFormState((prev) => ({ ...prev, ...e }))
		}
	}

	const handleSubmit = async (e) => {
		e.preventDefault()
		setIsLoading(true)
		setError(null)
		try {
			const {
				title,
				description,
				difficulty,
				grade,
				enableGenerate,
				newQuestionCount,
				quizRunQuestionCount,
				questionMix,
				quizId,
				questions,
			} = quizFormState

			const questionSet = {
				title,
				description,
				difficulty,
				grade,
				questions,
			}

			const config = {
				enableGenerate,
				newQuestionCount,
				quizRunQuestionCount,
				questionMix,
				quizId,
				mode,
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
		} finally {
			setIsLoading(false)
		}
	}

	if (isLoading && mode === "existing" && !quizFormState.title)
		return <div>Loading...</div>
	return (
		<>
			{error ? (
				<ErrorBox
					errorTitle="Could not create session."
					error={error}
				/>
			) : null}

			<QuizComposerView
				{...{
					quizFormState,
					handleChange,
					handleSubmit,
					mode,
					isLoading,
				}}
				locked={{}}
			>
				<GenerateDetails />
				{mode === "existing" ? <QuizRunDetails /> : null}
			</QuizComposerView>
		</>
	)
}

export const QuizComposerView = ({
	children,
	quizFormState,
	handleChange,
	handleSubmit,
	mode,
	locked = {},
	isLoading,
}) => {
	const { debug } = useDebug()

	const buttonText = (
		<>
			{quizFormState.enableGenerate === true ? (
				<>
					<Sparkles className="mr-2" />
					{mode === "new" ? "Generate & " : "Generate More & "}
				</>
			) : (
				<GraduationCap className="mr-2" />
			)}
			Run Quiz
		</>
	)

	return (
		<QuizFormContext.Provider
			value={{ quizFormState, handleChange, locked, mode }}
		>
			<div className="flex flex-col items-center bg-secondary rounded-2xl">
				<h1>Create a quiz</h1>
				<form
					onSubmit={handleSubmit}
					className="grid max-w-lg grid-cols-[auto_1fr] items-center gap-x-4 gap-y-2 pb-10 mb-10"
				>
					<InputField
						name="title"
						type="text"
						placeholder="French History..."
						required
					/>
					<InputField
						name="description"
						type="text"
						placeholder="Optional"
					/>
					<div></div>
					{!quizFormState.description ? (
						<p className="text-xs italic">
							This field will automatically generate if left
							blank.
						</p>
					) : null}

					<div className="col-span-2">{children}</div>

					<Button
						type="submit"
						className="col-span-2"
						disabled={isLoading}
					>
						{isLoading ? "Creating..." : buttonText}
					</Button>
				</form>
				{debug && (
					<details>
						<summary>`quizFormState` object</summary>
						<pre className="text-xs whitespace-pre-wrap">
							{JSON.stringify(quizFormState, null, 2)}
						</pre>
					</details>
				)}
			</div>
		</QuizFormContext.Provider>
	)
}

const GenerateDetails = () => {
	const { quizFormState, handleChange, mode } = useContext(QuizFormContext)

	const generateBox = (
		<div className="grid max-w-lg grid-cols-[auto_1fr] items-center gap-x-4 gap-y-2">
			<p className="col-span-2">Generate questions.</p>
			<InputField name="difficulty" type="text" />
			<InputField name="grade" type="text" />
			<InputField name="quizType" type="text" disabled={true} />
			<label htmlFor="newQuestionCount">Question count</label>
			<div>
				<Slider
					id="newQuestionCount"
					className="pt-6"
					value={[quizFormState.newQuestionCount]}
					onValueChange={([newValue]) => {
						const newMax =
							(quizFormState.questions?.length || 0) + newValue
						handleChange({
							newQuestionCount: newValue,
							maxQuestions: newMax,
							quizRunQuestionCount: Math.min(
								quizFormState.quizRunQuestionCount || newMax,
								newMax,
							),
						})
					}}
					max={10}
					min={1}
				/>
				<div className="text-center pt-1">
					{quizFormState.newQuestionCount}
				</div>
			</div>
		</div>
	)
	return (
		<div>
			<h2>
				Generate{" "}
				<Switch
					checked={quizFormState.enableGenerate}
					onCheckedChange={(isEnabled) => {
						const newMax = isEnabled
							? (quizFormState.questions?.length || 0) +
								quizFormState.newQuestionCount
							: quizFormState.questions?.length || 1
						handleChange({
							enableGenerate: isEnabled,
							questionMix: isEnabled ? "new" : "existing",
							maxQuestions: newMax,
							quizRunQuestionCount: Math.min(
								quizFormState.quizRunQuestionCount,
								newMax,
							),
						})
					}}
					disabled={mode === "new" ? true : false}
				/>
			</h2>

			{quizFormState.enableGenerate ? generateBox : null}
		</div>
	)
}

const QuizRunDetails = () => {
	const { quizFormState, handleChange, mode } = useContext(QuizFormContext)

	const toggleGroupItemStyle = "flex-grow-0 min-w-[160px]"

	return (
		<div>
			<h2>Quiz Run</h2>
			<div className="grid grid-cols-[auto_1fr] items-center gap-x-4 gap-y-2">
				<label htmlFor="questionMix" className="col-span-2">
					<p>
						What combination of questions would you like to answer?
					</p>
					<ToggleGroup
						type="single"
						aria-labelledby="question-mix-label"
						className="w-full flex flex-wrap gap-2"
						value={quizFormState.questionMix}
						onValueChange={(value) => {
							if (value) {
								handleChange({
									target: { name: "questionMix", value },
								})
							}
						}}
					>
						{quizFormState.enableGenerate === true && (
							<>
								<ToggleGroupItem
									value="new"
									className={toggleGroupItemStyle}
								>
									New only
								</ToggleGroupItem>
								<ToggleGroupItem
									value="mix"
									className={toggleGroupItemStyle}
								>
									New & existing mix
								</ToggleGroupItem>
							</>
						)}
						{mode === "existing" && (
							<>
								<ToggleGroupItem
									value="existing"
									className={toggleGroupItemStyle}
								>
									Existing
								</ToggleGroupItem>
							</>
						)}
					</ToggleGroup>
				</label>
				<label>Question count</label>
				<div>
					<Slider
						className="pt-6"
						value={[quizFormState.quizRunQuestionCount]}
						onValueChange={([newValue]) =>
							handleChange({
								target: {
									name: "quizRunQuestionCount",
									value: newValue,
								},
							})
						}
						max={quizFormState.maxQuestions || 1} // must be max available questions (incl. any newly generated)
						min={1}
					/>
					<div className="text-center pt-1">
						{quizFormState.quizRunQuestionCount}
					</div>
				</div>
			</div>
		</div>
	)
}

const InputField = ({ name, type, placeholder, required, ...props }) => {
	const { quizFormState, locked, handleChange } = useContext(QuizFormContext)
	const label = name.charAt(0).toUpperCase() + name.slice(1)
	return (
		<>
			<label htmlFor={name} className="justify-self-end">
				{required && <span aria-hidden="true">* </span>}
				{label}
			</label>
			<Input
				{...props}
				id={name}
				name={name}
				type={type}
				value={quizFormState[name] || ""}
				placeholder={placeholder}
				onChange={handleChange}
				disabled={props.disabled || !!locked[name]}
				required={required}
				aria-required={required}
				aria-label={label}
				className="w-full p-1 bg-white"
			/>
		</>
	)
}

export default QuizComposerPage
