export default {
	get props() {
		return { x: 0 };
	},

	html: `
		<p>Bar 0</p>
	`,

	test({ assert, component, target }) {
		component.x = 1;

		assert.htmlEqual(
			target.innerHTML,
			`
			<p>Foo 1</p>
		`
		);
	}
};
