export default {
	html: `Foo`,

	test({ assert, component }) {
		assert.ok(component.test);
	}
};
