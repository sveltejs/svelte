export default {
	solo: true,
	test(assert, component, target, window, raf) {
		component.set({ visible: true });
		const div = target.querySelector('div');

		raf.tick(25);
		component.set({ visible: false });

		assert.ok(~div.style.animation.indexOf('25ms'));
	},
};
