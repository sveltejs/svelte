export default {
	props: {
		x: true
	},

	html: `
		<p>true, therefore Foo</p>
	`,

	test({ assert, component, target }) {
		component.x = false;

		assert.htmlEqual(target.innerHTML, `
			<p>false, therefore Bar</p>
		`);
	}
};