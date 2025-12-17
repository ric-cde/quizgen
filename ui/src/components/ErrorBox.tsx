// @ts-nocheck

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircleIcon } from "lucide-react"

export const ErrorBox = ({ errorTitle, error }) => (
	<Alert variant="destructive">
		<AlertCircleIcon />
		<AlertTitle>{errorTitle}</AlertTitle>
		<AlertDescription>{error}</AlertDescription>
	</Alert>
)

export default ErrorBox
