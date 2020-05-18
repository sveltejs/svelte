export default {
	test({ assert, component }) {
		assert.equal(component.bar1, 42);
		assert.equal(component.bar2, 42);
		try {
			component.bar1 = 100;
		} catch (e) {
			assert.equal(e.message, 'Cannot set property bar1 of #<Main$> which has only a getter');
		}
		component.bar2 = 100;
		assert.equal(component.bar1, 42);
		assert.equal(component.bar2, 100);
	},
};
