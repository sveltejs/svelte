import { test } from '../../test';

export default test({
	test({ assert, component, target, raf }) {
		component.visible = true;

		const div = /** @type {HTMLDivElement & { foo: number, oof: number }} */ (
			target.querySelector('div')
		);

		raf.tick(0);

		assert.equal(div.foo, 0);
		assert.equal(div.oof, 1);

		raf.tick(50);
		assert.equal(div.foo, 0.5);
		assert.equal(div.oof, 0.5);
	}
});
