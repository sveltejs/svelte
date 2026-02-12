import { normalise_inspect_logs } from '../../../helpers.js';
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

		assert.deepEqual(normalise_inspect_logs(logs), [0, 1, 'at HTMLButtonElement.<anonymous>']);
	}
});
