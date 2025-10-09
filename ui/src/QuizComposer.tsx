// @ts-nocheck

import { useSearchParams } from "react-router"
import { useState, useEffect, useContext, createContext } from "react"
import { QUIZ_DEFAULTS } from "@/lib/constants.js"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"
import { Sparkles, GraduationCap } from "lucide-react"
import { ToggleGroup, ToggleGroupItem } from "./components/ui/toggle-group"

const QuizFormContext = createContext({
	quizFormState: {},
	handleChange: () => {},
	locked: {},
	mode: "new",
})

const QuizComposerPage = ({ quizId, mode }) => {
	const [params] = useSearchParams()

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
				title: params.get("title") || "",
				difficulty: QUIZ_DEFAULTS.DIFFICULTY,
				grade: QUIZ_DEFAULTS.GRADE,
			}
		} else if (mode === "existing") {
			// fetch(existing...)
			const existingQuestions = 5
			return {
				...initialState,
				quizRunQuestionCount: existingQuestions,
			}
		}
	}

	const [quizFormState, setQuizFormState] = useState(getInitialState)

	useEffect(() => {
		if (mode === "existing" && quizId)
			fetch(`/api/quiz/${quizId}`)
				.then((r) => r.json())
				.then((qSet) => setQuizFormState(qSet))
				.catch((err) => console.error("Failed to load quiz:", err))
	}, [mode, quizId])

	const handleChange = (e) => {
		// if event change from an input update
		if (e.target) {
			const { name, value, type, checked } = e.target
			const val = type === "checkbox" ? checked : value
			setQuizFormState((prev) => ({ ...prev, [name]: val }))
		} else {
			// plain object update
			setQuizFormState((prev) => ({ ...prev, ...e }))
		}
	}

	const navigate = useNavigate()

	const handleSubmit = (e) => {
		e.preventDefault()
		if (mode === "new") {
			const sampleId = "ajz"
			navigate(`/quiz/{ajz}/play`)
			// generate new questionSet
			// run new questionSet
		} else if (mode === "existing") {
			// update existing questionSet (if changes)
			// generate new questionSet (if flagged)
			// run new questionSet, or existing, or mix
		}
	}

	return (
		<QuizComposerView
			{...{
				quizFormState,
				handleChange,
				handleSubmit,
				mode,
			}}
			locked={{}}
		>
			<GenerateDetails />
			{mode === "existing" ? <QuizRunDetails /> : null}
		</QuizComposerView>
	)
}

export const QuizComposerView = ({
	children,
	quizFormState,
	handleChange,
	handleSubmit,
	mode,
	locked = {},
}) => {
	const ButtonText = () => {
		return (
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
	}

	return (
		<QuizFormContext.Provider
			value={{ quizFormState, handleChange, locked, mode }}
		>
			<div>
				<pre className="text-xs">
					{JSON.stringify(quizFormState, null, 2)}
				</pre>
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
					{!quizFormState.description && (
						<p className="col-span-2">
							This field will automatically generate if left
							blank.
						</p>
					)}

					<div className="col-span-2">{children}</div>

					<Button type="submit" className="col-span-2">
						<ButtonText />
					</Button>
				</form>
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
			<label>Question count</label>
			<div>
				<Slider
					className="pt-6"
					value={[quizFormState.newQuestionCount]}
					onValueChange={([newValue]) =>
						handleChange({
							target: {
								name: "newQuestionCount",
								value: newValue,
							},
						})
					}
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
						handleChange({
							enableGenerate: isEnabled,
							questionMix: isEnabled ? "new" : "existing",
						})
					}}
					// disabled={mode === "new" ? true : false}
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
			<p>Section for configuring current quiz run.</p>
			<div className="grid grid-cols-[auto_1fr] items-center gap-x-4 gap-y-2">
				<label className="col-span-2">
					<p>
						What combination of questions would you like to answer?
					</p>
					<ToggleGroup
						type="single"
						className="w-full flex-wrap gap-2"
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
						max={10} // must be max available questions (incl. any newly generated)
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
