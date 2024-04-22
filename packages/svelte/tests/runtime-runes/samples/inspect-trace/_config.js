import { test } from '../../test';

export default test({
	compileOptions: {
		dev: true
	},

	async test({ assert, target, logs }) {
		assert.deepEqual(logs, []);

		const [b1, b2] = target.querySelectorAll('button');
		b1.click();
		b2.click();
		await Promise.resolve();

		assert.ok(logs[0].stack.startsWith('Error:') && logs[0].stack.includes('HTMLButtonElement.'));
		assert.deepEqual(logs[1], 1);
	}
});
