import { test } from '../../test';

export default test({
	get props() {
		return { things: ['a', 'b', 'c'] };
	},

	test({ assert, component, target, raf }) {
		component.things = [];
		const div = /** @type {HTMLDivElement & { foo: Number }} */ (target.querySelector('div'));

		raf.tick(0);
		assert.equal(div.foo, 0);

		raf.tick(200);
		assert.equal(div.foo, 0.5);

		raf.tick(300);
		assert.equal(div.foo, 0.75);

		raf.tick(400);
		assert.equal(div.foo, 1);

		raf.tick(500);
	}
});
