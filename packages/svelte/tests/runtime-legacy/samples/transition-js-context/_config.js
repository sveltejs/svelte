import { test } from '../../test';

export default test({
	test({ assert, component, target, raf }) {
		component.visible = true;

		raf.tick(0);

		const div = /** @type {HTMLDivElement & { foo: number }} */ (target.querySelector('div'));
		assert.equal(div.foo, 42);

		raf.tick(50);
		assert.equal(div.foo, 42);
	}
});
