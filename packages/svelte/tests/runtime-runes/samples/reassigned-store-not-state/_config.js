import { test } from '../../test';

export default test({
	async test({ logs, assert }) {
		assert.deepEqual(logs, ['world']);
	}
});
