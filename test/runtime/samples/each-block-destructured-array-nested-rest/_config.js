export default {
	get props() {
		return {
			array: [
				[1, 2, 3, 4, 5],
				[6, 7, 8],
				[9, 10, 11, 12],
				[13, 14, 15, 16, 17, 18, 19, 20, 21, 22]
			]
		};
	},

	html: `
		<p>First: 1, Second: 2, Third: 3, Elements remaining: 2</p>
		<p>First: 6, Second: 7, Third: 8, Elements remaining: 0</p>
		<p>First: 9, Second: 10, Third: 11, Elements remaining: 1</p>
		<p>First: 13, Second: 14, Third: 15, Elements remaining: 7</p>
	`,

	test({ assert, component, target }) {
		component.array = [[23, 24, 25, 26, 27, 28, 29]];
		assert.htmlEqual(
			target.innerHTML,
			`
			<p>First: 23, Second: 24, Third: 25, Elements remaining: 4</p>
		`
		);
	}
};
