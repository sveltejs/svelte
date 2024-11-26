import { flushSync } from 'svelte';
import { test } from '../../test';

export default test({
	html: `<p>42</p><p>1337</p><button></button>`,
	async test({ assert, target, instance }) {
		const [a, b] = target.querySelectorAll('p');
		const btn = target.querySelector('button');

		flushSync(() => {
			btn?.click();
		});

		assert.equal(a.textContent, '1337');
		assert.equal(b.textContent, '42');
	}
});
