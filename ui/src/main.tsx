import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import "./index.css"
import { BrowserRouter } from "react-router"
import AppRouter from "./router.tsx"

createRoot(document.getElementById("root")!).render(
	<StrictMode>
		<BrowserRouter basename={import.meta.env.BASE_URL}>
			<AppRouter />
		</BrowserRouter>
	</StrictMode>
)
