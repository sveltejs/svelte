import { flushSync } from 'svelte';
import { test } from '../../test';
import { normalise_inspect_logs } from '../../../helpers.js';

export default test({
	compileOptions: {
		dev: true
	},

	async test({ assert, target, logs }) {
		const button = target.querySelector('button');

		flushSync(() => {
			button?.click();
		});

		assert.htmlEqual(target.innerHTML, `<button>update</button>\n1`);
		assert.deepEqual(normalise_inspect_logs(logs), [
			{
				data: {
					derived: 0,
					list: []
				},
				derived: []
			},
			{
				data: {
					derived: 0,
					list: [1]
				},
				derived: [1]
			},
			'at HTMLButtonElement.Main.button.__click'
		]);
	}
});
