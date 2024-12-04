import { test } from '../../test';

export default test({
	async test({ assert, logs }) {
		assert.deepEqual(logs, ['effect 1', 'effect 2']);
	}
});
