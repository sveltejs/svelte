export default {
	test({ assert, component, target }) {
		component.q = 42;
		component.foo = true;

		assert.htmlEqual(
			target.innerHTML,
			`
			<p>42</p>
		`
		);
	}
};
