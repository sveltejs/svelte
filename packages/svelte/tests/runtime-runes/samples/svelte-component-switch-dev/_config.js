import { flushSync } from 'svelte';
import { test } from '../../test';

export default test({
	mode: ['client'],
	compileOptions: {
		hmr: true,
		dev: true
	},
	test({ target, assert }) {
		assert.htmlEqual(target.innerHTML, `<button>switch</button> A`);

		target.querySelector('button')?.click();
		flushSync();
		assert.htmlEqual(target.innerHTML, `<button>switch</button> B`);
	}
});
