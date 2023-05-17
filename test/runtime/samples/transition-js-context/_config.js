export default {
	test({ assert, component, target, raf }) {
		component.visible = true;

		const div = target.querySelector('div');
		assert.equal(div.foo, 42);

		raf.tick(50);
		assert.equal(div.foo, 42);
	}
};
