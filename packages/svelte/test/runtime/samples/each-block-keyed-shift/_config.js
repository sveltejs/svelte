export default {
	get props() {
		return {
			titles: [{ name: 'a' }, { name: 'b' }, { name: 'c' }]
		};
	},

	html: `
		<p>a</p>
		<p>b</p>
		<p>c</p>
	`,

	test({ assert, component, target }) {
		component.titles = [{ name: 'b' }, { name: 'c' }];

		assert.htmlEqual(
			target.innerHTML,
			`
			<p>b</p>
			<p>c</p>
		`
		);

		component.titles = [{ name: 'c' }];

		assert.htmlEqual(
			target.innerHTML,
			`
			<p>c</p>
		`
		);
	}
};
