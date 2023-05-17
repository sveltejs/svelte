export default {
	get props() {
		return { a: 1 };
	},

	html: `
		<p>foo 1</p>
	`,

	test({ assert, component, target }) {
		component.a = 2;
		assert.htmlEqual(
			target.innerHTML,
			`
			<p>foo 2</p>
		`
		);
	}
};
