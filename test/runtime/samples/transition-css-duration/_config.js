export default {
	test({ assert, component, target, raf }) {
		component.visible = true;
		const div = target.querySelector('div');

		raf.tick(25);

		component.visible = false;

		raf.tick(26);
		assert.ok(~div.style.animation.indexOf('25ms'));
	}
};
