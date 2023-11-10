import { test } from '../../test';

export default test({
	test({ assert, component, target, raf }) {
		// @ts-expect-error
		global.count = 0;

		component.visible = true;
		// @ts-expect-error
		assert.equal(global.count, 1);
		const div = /** @type {HTMLDivElement & { foo: Number }} */ (target.querySelector('div'));
		raf.tick(0);
		assert.equal(div.foo, 0);

		raf.tick(300);
		assert.equal(div.foo, 0.75);

		component.visible = false;
		// @ts-expect-error
		assert.equal(global.count, 2);

		raf.tick(500);
		assert.equal(div.foo, 0.25);

		component.visible = true;
		raf.tick(700);
		assert.equal(div.foo, 0.75);

		raf.tick(800);
		assert.equal(div.foo, 1);

		raf.tick(900);
	}
});
