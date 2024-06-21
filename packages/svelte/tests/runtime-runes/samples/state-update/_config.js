import { test } from '../../test';

export default test({
	test({ assert, logs }) {
		assert.deepEqual(logs, [1, 1, 1, 1]);
	}
});
