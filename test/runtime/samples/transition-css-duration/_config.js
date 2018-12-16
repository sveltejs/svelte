export default {
	test({ assert, component, target, window, raf }) {
		component.visible = true;
		const div = target.querySelector('div');

		raf.tick(25);
		component.visible = false;

		assert.ok(~div.style.animation.indexOf('25ms'));
	},
};
