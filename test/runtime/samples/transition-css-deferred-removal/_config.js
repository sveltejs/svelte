export default {
	data: {
		visible: true
	},

	test(assert, component, target, window, raf) {
		component.set({ visible: false });

		const outer = target.querySelector('.outer');
		const inner = target.querySelector('.inner');

		const animations = [
			outer.style.animation,
			inner.style.animation
		];

		raf.tick(150);

		assert.deepEqual([
			outer.style.animation,
			inner.style.animation
		], animations);
	},
};
