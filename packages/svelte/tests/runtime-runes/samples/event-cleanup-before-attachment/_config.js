import { test } from '../../test';

export default test({
	async test({ assert, logs }) {
		await new Promise((resolve) => setTimeout(resolve));
		assert.deepEqual(logs, []);
	}
});
