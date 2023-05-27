export default {
	get props() {
		return { visible: true };
	},

	test({ assert, component, target, raf }) {
		component.visible = false;
		const div = target.querySelector('div');

		raf.tick(50);
		assert.equal(div.foo, 0.5);

		component.$destroy();

		raf.tick(100);
	}
};
