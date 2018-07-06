export default {
	test ( assert, component, target, window, raf ) {
		component.set({ visible: true });
		const div = target.querySelector('div');

		component.set({ visible: false });
		assert.equal(window.getComputedStyle(div).opacity, 1);

		raf.tick(200);
		assert.equal(window.getComputedStyle(div).opacity, 0.5);
		component.set({ blabla: false });

		raf.tick(400);
		assert.equal(window.getComputedStyle(div).opacity, 0);

		raf.tick(600);
		assert.equal(component.refs.div, undefined);
		assert.equal(target.querySelector('div'), undefined);

		component.destroy();
	}
};