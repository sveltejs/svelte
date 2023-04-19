export default {
	props: {
		array: [
      [1, 2, 3, 4, 5],
      [6, 7, 8],
      [9, 10, 11, 12]
		]
	},

	html: `
		<p>First: 1, Third: 3, Length: 5</p>
		<p>First: 6, Third: 8, Length: 3</p>
		<p>First: 9, Third: 11, Length: 4</p>
	`,

	test({ assert, component, target }) {
		component.array = [[12, 13]];
		assert.htmlEqual( target.innerHTML, `
			<p>First: 12, Third: undefined, Length: 2</p>
		`);
	}
};
