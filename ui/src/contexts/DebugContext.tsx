// @ts-nocheck
import { createContext, useContext, useState } from "react"

const DebugContext = createContext({
	debug: false,
	toggleDebug: () => {},
})

export const DebugProvider = ({ children }) => {
	const envDebug = import.meta.env.VITE_DEBUG

	const [debug, setDebug] = useState(() => {
		if (envDebug === "true") return true
		if (envDebug === "false") return false

		return import.meta.env.DEV
	})

	const toggleDebug = () => {
		setDebug((prev) => {
			const newValue = !prev
			localStorage.setItem("debug", String(newValue))
			return newValue
		})
	}

	return (
		<DebugContext.Provider value={{ debug, toggleDebug }}>
			{children}
		</DebugContext.Provider>
	)
}

export const useDebug = () => useContext(DebugContext)
