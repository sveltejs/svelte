export default {
	html: `
		<p>Foo</p>
	`,

	test({ assert, component, target }) {
		component.x = component.Bar;

		assert.htmlEqual(target.innerHTML, `
			<p>Bar</p>
		`);
	}
};