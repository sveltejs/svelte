import { test } from '../../test';

export default test({
	async test({ assert, logs }) {
		assert.deepEqual(logs, ['mounted']);
	}
});
