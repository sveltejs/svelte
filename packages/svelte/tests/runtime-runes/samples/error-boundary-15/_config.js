import { test } from '../../test';

export default test({
	mode: ['client'],

	test({ assert, logs }) {
		assert.deepEqual(logs, ['error caught 1', 'error caught 2']);
	}
});
