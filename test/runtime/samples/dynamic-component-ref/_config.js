export default {
	html: `Foo`,

	test(assert, component) {
		assert.ok(component.refs.test);
	}
};
