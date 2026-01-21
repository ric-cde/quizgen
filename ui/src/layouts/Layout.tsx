import { NavLink } from "react-router"
import { Outlet } from "react-router"

const Layout = () => {
	return (
		<div className="min-h-dvh bg-gray-200">
			<div className="mx-auto w-full sm:w-[640px] md:w-[768px] max-w-[1100px] [&>*]:px-4">
				<Navigation />
				<Outlet />
			</div>
		</div>
	)
}

const Navigation = () => {
	const navItems = [
		{ path: "/", label: "Home" },
		{ path: "/compose", label: "Compose Quiz" },
		// { path: "/quiz/play", label: "Play Quiz" },
	]

	return (
		<nav className="border-b border-border p-3">
			<ul className="flex list-none gap-x-4 justify-between">
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
		</li>
	)
}

export default Layout
