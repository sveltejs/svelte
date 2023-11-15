import { test } from '../../test';

export default test({
	intro: true,

	skip_if_hydrate: 'permanent',

	test({ assert, target, raf }) {
		const div = /** @type {HTMLDivElement & { foo: number }} */ (target.querySelector('div'));
		raf.tick(0);
		assert.equal(div.foo, 0);

		raf.tick(50);
		assert.equal(div.foo, 0.5);
	}
});
