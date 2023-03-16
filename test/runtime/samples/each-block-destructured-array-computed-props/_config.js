export default {
	props: {
		array: [
			[1, 2, 3, 4, 5],
			[6, 7, 8],
			[9, 10, 11, 12],
			[13, 14, 15, 16, 17, 18, 19, 20, 21, 22]
		]
	},

	html: `
		<p>First: 1, Half: 3, Last: 5, Length: 5</p>
		<p>First: 6, Half: 7, Last: 8, Length: 3</p>
		<p>First: 9, Half: 11, Last: 12, Length: 4</p>
		<p>First: 13, Half: 18, Last: 22, Length: 10</p>
	`,

	test({ assert, component, target }) {
		component.array = [[23, 24, 25, 26, 27, 28, 29]];
		assert.htmlEqual( target.innerHTML, `
			<p>First: 23, Half: 26, Last: 29, Length: 7</p>
		`);
	}
};
