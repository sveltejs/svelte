export default {
	html: `
		<p>Foo</p>
	`,

	nestedTransitions: true,

	test(assert, component, target) {
		const Foo = component.Foo;

		component.Foo = null;

		assert.htmlEqual(target.innerHTML, ``);

		component.Foo = Foo;

		assert.htmlEqual(target.innerHTML, `
			<p>Foo</p>
		`);
	}
};