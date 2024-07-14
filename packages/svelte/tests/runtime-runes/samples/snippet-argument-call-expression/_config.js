import { test } from '../../test';

export default test({
	test({ assert, logs }) {
		assert.deepEqual(logs, ['invoked']);
	},
	test_ssr({ assert, logs }) {
		assert.deepEqual(logs, ['invoked']);
	}
});
