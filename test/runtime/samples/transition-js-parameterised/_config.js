export default {
	test({ assert, component, target, raf }) {
		component.visible = true;
		const div = target.querySelector('div');
		assert.equal(div.foo, 0);

		raf.tick(50);
		assert.equal(div.foo, 100);

		raf.tick(100);
		assert.equal(div.foo, 200);

		raf.tick(101);
	}
};
