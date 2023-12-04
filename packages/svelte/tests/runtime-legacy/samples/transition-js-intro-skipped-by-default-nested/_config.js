import { test } from '../../test';

export default test({
	test({ assert, target, raf }) {
		const div = /** @type {HTMLDivElement & { foo: number }} */ (target.querySelector('div'));
		assert.equal(div.foo, undefined);

		raf.tick(50);
		assert.equal(div.foo, undefined);
	}
});
