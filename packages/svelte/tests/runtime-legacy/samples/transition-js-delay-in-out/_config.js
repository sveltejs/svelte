import { test } from '../../test';

export default test({
	test({ assert, component, target, raf }) {
		component.visible = true;
		const div = /** @type {HTMLDivElement & { foo: number, bar: number }} */ (
			target.querySelector('div')
		);

		raf.tick(0);

		assert.equal(div.foo, 0);

		raf.tick(50);
		assert.equal(div.foo, 0);

		raf.tick(150);
		assert.equal(div.foo, 1);

		component.visible = false;
		assert.equal(div.bar, undefined);

		raf.tick(200);
		assert.equal(div.bar, 1);

		raf.tick(300);
		assert.equal(div.bar, 0);
	}
});
