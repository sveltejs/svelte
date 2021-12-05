export default {
	test({ assert, component, target, window, raf }) {
		component.visible = true;
		const div = target.querySelector('div');

		component.visible = false;
		assert.equal(window.getComputedStyle(div).opacity, 1);

		raf.tick(200);
		assert.equal(window.getComputedStyle(div).opacity, 0.5);

		raf.tick(400);
		assert.equal(window.getComputedStyle(div).opacity, 0);

		raf.tick(600);
		assert.equal(component.div, undefined);
		assert.equal(target.querySelector('div'), undefined);
	}
};
