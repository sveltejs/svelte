import { test } from '../../test';

export default test({
	compileOptions: {
		dev: true
	},

	async test({ assert, target, logs }) {
		const [b1] = target.querySelectorAll('button');
		b1.click();
		await Promise.resolve();

		assert.deepEqual(logs, [
			'init',
			{ x: { count: 0 } },
			[{ count: 0 }],
			'update',
			{ x: { count: 1 } },
			[{ count: 1 }]
		]);
	}
});
