import { useState } from "react"
import "./App.css"
import { Button } from "@/components/ui/button"
import { CodeXml, Plus, Compass, Download } from "lucide-react"

function App() {
	const [count, setCount] = useState(0)

	const handleClick = () => {
		setCount(count + 1)
	}

	return (
		<>
			<div className="flex">
				<Sidebar />
			</div>
			<div className="flex min-h-svh flex-col items-center justify-center">
				<Button onClick={handleClick}>Click me</Button>
				<p className="">{count}</p>
			</div>{" "}
		</>
	)
}

const Sidebar = () => {
	return (
		<div className="fixed top-0 left-0 h-screen w-16 m-0 flex flex-col bg-gray-900 text-white shadow-lg">
			<SideBarIcon icon={CodeXml} />
			<SideBarIcon icon={Plus} />
			<SideBarIcon icon={Compass} />
			<SideBarIcon icon={Download} />
		</div>
	)
}

const SideBarIcon = ({ icon: Icon, text = "tooltip 💡" }) => (
	<div className="sidebar-icon group">
		<Icon />

		<span className="sidebar-tooltip group-hover:scale-100">{text}</span>
	</div>
)

export default App
