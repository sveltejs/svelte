import { flushSync } from 'svelte';
import { test } from '../../test';

export default test({
	mode: ['client'],

	test({ assert, target, logs }) {
		const [b1] = target.querySelectorAll('button');

		b1?.click();
		b1?.click();
		b1?.click();
		flushSync();
		assert.htmlEqual(target.innerHTML, '<section><button>clicks: 3</button></section>');
		assert.deepEqual(logs, []);
	}
});
