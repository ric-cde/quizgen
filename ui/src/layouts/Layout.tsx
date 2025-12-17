import { NavLink } from "react-router"
import { Outlet } from "react-router"

const Layout = () => {
	return (
		<div className="min-h-dvh pt-10">
			<div className="mx-auto w-full sm:w-[640px] md:w-[800px] max-w-[800px] px-4 bg-gray-100">
				<Navigation />
				<Outlet />
			</div>
		</div>
	)
}

const Navigation = () => {
	const navItems = [
		{ path: "/", label: "Home" },
		{ path: "/compose", label: "Create Quiz" },
		{ path: "/quiz/play", label: "Play Quiz" },
	]

	return (
		<nav className="border-b border-border p-2">
			<ul className="flex list-none gap-x-4 ">
				{navItems.map((item) => (
					<NavItem key={item.path} to={item.path}>
						{item.label}
					</NavItem>
				))}
			</ul>
		</nav>
	)
}

const NavItem = ({
	to,
	children,
}: {
	to: string
	children: React.ReactNode
}) => {
	const base =
		"block rounded-md px-3 py-2 transition-colors text-foreground hover:bg-accent hover:text-primary"
	const end = to === "/"

	return (
		<li>
			<NavLink
				to={to}
				end={end}
				className={({ isActive }) =>
					isActive
						? `${base} underline font-semibold`
						: `${base} hover:underline`
				}
			>
				{children}
			</NavLink>
			<br />
		</li>
	)
}

export default Layout
