export default {
	props: {
		things: ['a', 'b', 'c']
	},

	test({ assert, component, target, window, raf }) {
		component.things = [];
		const div = target.querySelector('div');
		assert.equal(div.foo, 0);

		raf.tick(200);
		assert.equal(div.foo, 0.5);

		raf.tick(300);
		assert.equal(div.foo, 0.75);

		raf.tick(400);
		assert.equal(div.foo, 1);

		raf.tick(500);
	}
};
