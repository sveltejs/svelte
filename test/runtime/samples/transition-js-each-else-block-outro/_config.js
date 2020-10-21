export default {
	props: {
		things: []
	},
	test({ assert, component, target, window, raf }) {
		const div = target.querySelector('div');
		component.things = ['a', 'b', 'c'];

		raf.tick(200);
		assert.equal(div.foo, 0.5);

		raf.tick(300);
		assert.equal(div.foo, 0.25);

		raf.tick(400);
		assert.equal(div.foo, 0);

		raf.tick(500);
	}
};
