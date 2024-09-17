import { test } from '../../test';

export default test({
	compileOptions: {
		dev: true
	},

	async test({ assert, logs, target }) {
		const [btn] = target.querySelectorAll('button');
		btn.click();
		btn.click();
		await Promise.resolve();

		assert.deepEqual(logs, ['init', [], 'update', [{}], 'update', [{}, {}]]);
	}
});
