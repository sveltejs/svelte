export default {
	test(assert, component) {
		assert.ok(!component.destroyed);
		component.destroy();
		assert.ok(component.destroyed);
	}
};