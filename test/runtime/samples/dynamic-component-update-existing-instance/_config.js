export default {
	props: {
		x: 1
	},

	html: `
		<p>Foo 1</p>
	`,

	test({ assert, component, target }) {
		component.x = 2;

		assert.htmlEqual(target.innerHTML, `
			<p>Foo 2</p>
		`);
	}
};