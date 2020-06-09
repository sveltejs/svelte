export default {
	test({ assert, component, target, window, raf }) {
		component.visible = true;

		const div = target.querySelector('div');

		raf.tick(50);
		assert.equal(div.foo, 0.5);
		assert.equal(div.oof, 0.5);
	}
};
