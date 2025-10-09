// @ts-nocheck

import { useState } from "react"

const QuizRunner = () => {
	return (
		<div>
			<h1>Take a quiz</h1>
		</div>
	)
}

export default QuizRunner

const TweetSearchResults = ({ tweets }) => {
	const [inThisLocation, setInThisLocation] = useState(false)
	const [filterText, setFilterText] = useState("")

	return (
		<div>
			<SearchBar
				filterText={filterText}
				setFilterText={setFilterText}
				inThisLocation={inThisLocation}
				setInThisLocation={setInThisLocation}
			/>
			<TweetList
				filterText={filterText}
				inThisLocation={inThisLocation}
				tweets={tweets}
			/>
		</div>
	)
}

const SearchBar = ({
	filterText,
	setFilterText,
	inThisLocation,
	setInThisLocation,
}) => {
	return (
		<div>
			<form>
				<input
					type="text"
					placeholder="Search..."
					onChange={(e) => setFilterText(e.currentTarget.value)}
					value={filterText}
				/>

				<p>
					<label>
						<input
							type="checkbox"
							checked={inThisLocation}
							onChange={() => setInThisLocation(e.target.checked)}
						/>{" "}
						Only show tweets in your location
					</label>
				</p>
			</form>
		</div>
	)
}

const TweetList = ({ tweets, filterText, inThisLocation }) => {
	const rows = []
	const lastCategory = null

	tweets.forEach((tweet) => {
		if (inThisLocation && !tweet.isLocal) {
			return
		}
		if (!tweet.text.toLowerCase().includes(filterText.toLowerCase())) {
			return
		}
		if (tweet.category !== lastCategory) {
			rows.push(
				<TweetCategory category={tweet.category} key={tweet.category} />
			)
		}
		rows.push(<TweetRow tweet={tweet} key={tweet.text} />)
		lastCategory = tweet.category
	})

	return <div>{rows}</div>
}

const TweetCategory = ({ category }) => {
	return (
		<tr>
			<th colSpan="2">{category}</th>
		</tr>
	)
}

const TweetRow = ({ tweet }) => {
	const color = isLocal ? "color: red;" : "color: inherit;"
	return (
		<tr>
			<td style={color}>{tweet.text}</td>
			<td>{tweet.retweets}</td>
		</tr>
	)
}
