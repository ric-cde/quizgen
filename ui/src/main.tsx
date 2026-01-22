import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import "./index.css"
import { BrowserRouter } from "react-router"
import AppRouter from "./router.tsx"
import { DebugProvider } from "@/contexts/DebugContext.tsx"

createRoot(document.getElementById("root")!).render(
	<StrictMode>
		<DebugProvider>
			<BrowserRouter basename={import.meta.env.BASE_URL}>
				<AppRouter />
			</BrowserRouter>
		</DebugProvider>
	</StrictMode>,
)
