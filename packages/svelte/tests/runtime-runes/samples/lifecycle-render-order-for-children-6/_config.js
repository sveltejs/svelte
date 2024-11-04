import { test } from '../../test';

export default test({
	async test({ assert, logs }) {
		assert.deepEqual(logs, [0, 1, 2, 3, 4, 5, 6]);
	}
});
