import { normalise_inspect_logs } from '../../../helpers.js';
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

		assert.deepEqual(normalise_inspect_logs(logs), [
			[],
			[{}],
			'at HTMLButtonElement.Main.button.__click',
			[{}, {}],
			'at HTMLButtonElement.Main.button.__click'
		]);
	}
});
