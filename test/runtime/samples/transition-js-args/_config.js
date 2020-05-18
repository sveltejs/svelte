export default {
	test({ assert, component, target, window, raf }) {
		component.visible = true;

		const div = target.querySelector('div');

		raf.tick(10);
		assert.equal(Math.round(div.foo * 100) / 100, 0.1);
		assert.equal(Math.round(div.oof * 100) / 100, 0.9);

		raf.tick(50);
		assert.equal(div.foo, 0.5);
		assert.equal(div.oof, 0.5);
	},
};
