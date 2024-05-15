import { test } from '../../test';

export default test({
	async test({ assert, logs, target }) {
		assert.deepEqual(logs, ['primitive', 'object']);
		await target.querySelector('button')?.click();
		assert.deepEqual(logs, ['primitive', 'object', 'object']);
	}
});
