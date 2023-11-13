import { test } from '../../test';

export default test({
	test({ assert, component, target, raf }) {
		component.visible = true;
		const div = /** @type {HTMLDivElement & { foo: number }} */ (target.querySelector('div'));

		raf.tick(0);

		assert.equal(div.foo, 0);

		raf.tick(50);
		assert.equal(div.foo, 0);

		raf.tick(100);
		assert.equal(div.foo, 0.5);

		component.visible = false;

		raf.tick(125);
		assert.equal(div.foo, 0.75);

		raf.tick(150);
		assert.equal(div.foo, 1);

		raf.tick(175);
		assert.equal(div.foo, 0.75);

		raf.tick(250);
		assert.equal(div.foo, 0);
	}
});
