import { test } from '../../test';

export default test({
	compileOptions: {
		dev: true
	},

	async test({ assert, target, logs }) {
		const [b1, b2] = target.querySelectorAll('button');
		b1.click();
		b2.click();
		await Promise.resolve();

		assert.deepEqual(logs, ['init', 0, 0, 'update', 1, 0, 'update', 1, 1]);
	}
});
