import { test } from '../../test';

export default test({
	async test({ assert, target, logs }) {
		const btn = target.querySelector('button');
		await btn?.click();

		assert.deepEqual(logs, ['works!']);
	}
});
