import { defineConfig } from "vite"
import path from "path"
import react from "@vitejs/plugin-react-swc"
import tailwindcss from "@tailwindcss/vite"
// import { reactRouter } from "@react-router/dev/vite"

// https://vite.dev/config/
export default defineConfig({
	plugins: [
		react(),
		tailwindcss(),
		// , reactRouter()
	],
	resolve: {
		alias: {
			"@": path.resolve(__dirname, "./src"),
		},
	},
})
