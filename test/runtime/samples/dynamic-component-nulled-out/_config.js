export default {
	html: `
		<p>Foo</p>
	`,

	nestedTransitions: true,

	test(assert, component, target) {
		const state = component.get();

		component.Foo = null;

		assert.htmlEqual(target.innerHTML, ``);

		component.Foo = state.Foo;

		assert.htmlEqual(target.innerHTML, `
			<p>Foo</p>
		`);
	}
};