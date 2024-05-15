import { test } from '../../test';

export default test({
	html: `<button>increment</button>`,

	async test({ assert, target, logs }) {
		const btn = target.querySelector('button');

		assert.deepEqual(logs, [1]);

		await btn?.click();
		assert.deepEqual(logs, [1, 2]);

		await btn?.click();
		assert.deepEqual(logs, [1, 2, 3]);
	}
});
