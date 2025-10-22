import { normalise_inspect_logs } from '../../../helpers.js';
import { test } from '../../test';

export default test({
	compileOptions: {
		dev: true
	},

	async test({ assert, target, logs }) {
		const [b1] = target.querySelectorAll('button');
		b1.click();
		await Promise.resolve();

		assert.deepEqual(normalise_inspect_logs(logs), [
			{ x: { count: 0 } },
			[{ count: 0 }],
			{ x: { count: 1 } },
			[{ count: 1 }],
			'at HTMLButtonElement.<anonymous>'
		]);
	}
});
