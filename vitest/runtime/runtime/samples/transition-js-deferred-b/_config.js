export default {
	test({ assert, component, target, raf }) {
		component.visible = true;

		return Promise.resolve().then(() => {
			const div = target.querySelector('.foo');
			assert.equal(div.foo, 0);

			raf.tick(50);
			assert.equal(div.foo, 0.5);
		});
	}
};
