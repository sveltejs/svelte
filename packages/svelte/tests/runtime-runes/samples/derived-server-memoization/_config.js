import { test } from '../../test';

export default test({
	test_ssr({ assert, logs }) {
		assert.deepEqual(logs, [0, 2, { count: 2 }, 0, 0, { local_count: 1 }]);
	},

	test({ assert, logs }) {
		assert.deepEqual(logs, [0, 2, { count: 2 }, 0, 0, { local_count: 1 }]);
	}
});
