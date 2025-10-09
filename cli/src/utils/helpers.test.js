import { sanitiseInput, slugify } from "./helpers.js"

describe("santiseInput()", () => {
	it("all special characters and spaces correctly removed", () => {
		const badString = "  @#)$%)^&)Valid - string_55  "
		expect(sanitiseInput(badString)).toBe("Valid - string_55")
	})

	it("input with relative path symbols rejected", () => {
		const badString = "../invalid-string/secrets.js"
		expect(sanitiseInput(badString)).toBe("")
	})
})

describe("slugify()", () => {
	it("all special characters and spaces correctly removed", () => {
		const badString =
			"  The !@#$%^&*()_ History of the French   Revolution (1789-1793)   "
		expect(slugify(badString)).toBe("history-french-revolution-1789-1793")
	})
	it("long title (40+ chars) with long word both trimmed back", () => {
		const badString =
			"Revolutionary war on the Transsiberian railexpressway in the 20th century"
		expect(slugify(badString)).toBe(
			"revolution-war-transsiber-railexpres-20t"
		)
	})
})
