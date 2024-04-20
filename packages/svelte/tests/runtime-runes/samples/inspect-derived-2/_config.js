import { flushSync } from 'svelte';
import { test } from '../../test';

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
		assert.deepEqual(logs, [
			'init',
			{
				data: {
					derived: 0,
					list: []
				},
				derived: []
			},
			'update',
			{
				data: {
					derived: 0,
					list: [1]
				},
				derived: [1]
			}
		]);
	}
});
