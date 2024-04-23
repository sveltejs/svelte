import { test } from '../../test';

export default test({
	async test({ assert, logs }) {
		await Promise.resolve();
		await Promise.resolve();
		assert.deepEqual(logs, ['a1: ', true, 'b1: ', true]);
	}
});
