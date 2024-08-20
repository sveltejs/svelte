import { test } from '../../test';

export default test({
	mode: ['client'], // TODO: make this work in SSR too

	test({ assert, logs }) {
		assert.deepEqual(logs, [0, 1, 2, 2, 2, 3]);
	}
});
