export default {
	intro: true,

	skip_if_hydrate: true,

	test({ assert, component, target, window, raf }) {
		const div = target.querySelector('div');
		raf.tick(50);
		assert.equal(div.foo, 0.5);
	},
};
