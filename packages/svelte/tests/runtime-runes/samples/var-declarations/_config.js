import { test } from '../../test';

export default test({
	test({ assert, logs }) {
		assert.deepEqual(logs, [undefined, undefined, 10, 20, 0, 1]);
	}
});
