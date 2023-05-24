export default {
	get props() {
		return { x: true };
	},

	html: `
		<div><p>true, therefore Foo</p></div>
	`,

	test({ assert, component, target }) {
		component.x = false;

		assert.htmlEqual(
			target.innerHTML,
			`
			<div><p>false, therefore Bar</p></div>
		`
		);
	}
};
