import { test } from '../../test';

export default test({
	async test({ assert, target, logs }) {
		const btn = target.querySelector('button');

		btn?.click();
		await Promise.resolve();
		assert.deepEqual(logs, ['div onclickcapture', 'button onclick']);
	}
});
