export default {
	skip: true, // There's a nullpointer triggered by the test which wasn't caught by mocha for some reason. TODO reenable for Svelte 5
	test({ assert, component, target, raf }) {
		component.visible = true;

		return Promise.resolve().then(() => {
			const div = target.querySelector('div');
			assert.equal(div.foo, 0);

			raf.tick(50);
			assert.equal(div.foo, 0.5);
		});
	}
};
