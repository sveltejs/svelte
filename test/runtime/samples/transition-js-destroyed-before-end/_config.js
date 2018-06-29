export default {
	skipIntroByDefault: true,

	data: {
		visible: true
	},

	test(assert, component, target, window, raf) {
		component.set({ visible: false });
		const div = target.querySelector('div');

		raf.tick(50);
		assert.equal(div.foo, 0.5);

		component.destroy();

		raf.tick(100);
	},
};
