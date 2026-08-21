import { flushSync } from 'svelte';
import { test } from '../../test';

export default test({
	html: '<button>increment</button><p>2</p>',
	mode: ['client'],
	test({ target, assert }) {
		const btn = target.querySelector('button');
		const p = target.querySelector('p');

		flushSync(() => {
			btn?.click();
		});

		assert.equal(p?.innerHTML, '4');
	}
});
