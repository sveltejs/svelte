import { test } from '../../test';

export default test({
	test({ assert, mod }) {
		assert.deepEqual(mod.preload({ foo: 1 }), { bar: 2 });
	}
});
