// @ts-nocheck
import { NavLink } from "react-router"
import { Outlet } from "react-router"
import { Pencil } from "lucide-react"

const Layout = () => {
	return (
		<div className="min-h-dvh bg-background">
			<div className="mx-auto w-full sm:w-[640px] md:w-[768px] max-w-[1100px] [&>*]:px-4">
				<Navigation />
				<Outlet />
			</div>
		</div>
	)
}

const Navigation = () => {
	const navItems = [
		{ path: "/", label: "QuizGen", styles: "" },
		{
			path: "/compose",
			label: "Compose",
			icon: <Pencil />,
			styles: "border-accent border-2 rounded-lg",
		},
		// { path: "/quiz/play", label: "Play Quiz" },
	]

	return (
		<nav className="p-3">
			<ul className="flex list-none gap-x-4 justify-between">
				{navItems.map(({ label, styles, path, icon }) => (
					<NavItem key={path} to={path} {...{ styles }}>
						{icon} {label}
					</NavItem>
				))}
			</ul>
		</nav>
	)
}

const NavItem = ({ to, children, styles }) => {
	const base =
		"flex block font-semibold rounded-md gap-1 px-3 py-2 transition-colors text-accent hover:bg-accent hover:text-background"
	const end = to === "/"

	return (
		<li>
			<NavLink
				to={to}
				end={end}
				className={({ isActive }) =>
					isActive
						? `${base} underline underline-offset-15 decoration-4`
						: `${base} ${styles} border-0`
				}
			>
				{children}
			</NavLink>
		</li>
	)
}

export default Layout
