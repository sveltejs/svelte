import { flushSync } from 'svelte';
import { test } from '../../test';

export default test({
	mode: ['client'],
	compileOptions: {
		runes: undefined
	},
	async test({ assert, target, logs }) {
		const p = target.querySelector('p');
		const btn = target.querySelector('button');
		flushSync(() => {
			btn?.click();
		});
		assert.equal(p?.innerHTML, '0');
	}
});
