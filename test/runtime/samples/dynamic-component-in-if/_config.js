export default {
	html: `
		<p>Foo</p>
	`,

	test(assert, component, target) {
		const { Bar } = component.get();

		component.set({
			x: Bar
		});

		assert.htmlEqual(target.innerHTML, `
			<p>Bar</p>
		`);
	}
};