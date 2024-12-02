import { flushSync } from 'svelte';
import { test } from '../../test';

export default test({
	compileOptions: {
		dev: true
	},

	async test({ assert, target, logs }) {
		const [btn, btn2] = target.querySelectorAll('button');
		btn.click();
		btn2.click();
		flushSync();

		assert.deepEqual(logs, [
			'init',
			new Map(),
			'init',
			new Set(),
			'update',
			new Map([['a', 'a']]),
			'update',
			new Set(['a'])
		]);
	}
});
