export default {
	skipIntroByDefault: true,

	test(assert, component, target, window, raf) {
		component.set({ visible: true });

		return Promise.resolve().then(() => {
			const div = target.querySelector('div');
			assert.equal(div.foo, 0);

			raf.tick(50);
			assert.equal(div.foo, 0.5);
		});
	},
};
