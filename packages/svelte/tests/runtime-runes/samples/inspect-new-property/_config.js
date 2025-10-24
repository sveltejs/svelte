import { normalise_inspect_logs } from '../../../helpers.js';
import { test } from '../../test';

export default test({
	compileOptions: {
		dev: true
	},

	async test({ assert, target, logs }) {
		const [btn] = target.querySelectorAll('button');
		btn.click();
		await Promise.resolve();

		assert.deepEqual(normalise_inspect_logs(logs), [
			{},
			[],
			{ x: 'hello' },
			'at HTMLButtonElement.Main.button.__click',
			['hello'],
			'at HTMLButtonElement.Main.button.__click'
		]);
	}
});
