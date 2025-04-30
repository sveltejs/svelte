import { flushSync } from 'svelte';
import { test } from '../../test';

export default test({
	mode: ['client'],

	compileOptions: {
		dev: true
	},

	test({ assert, target, logs }) {
		const [b1] = target.querySelectorAll('button');

		b1.click();
		flushSync();
		assert.htmlEqual(target.innerHTML, '<button data-step="2">clicks: 2</button>');
		assert.deepEqual(logs, []);
	}
});
