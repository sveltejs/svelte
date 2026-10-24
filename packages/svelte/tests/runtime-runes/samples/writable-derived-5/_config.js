import { flushSync } from 'svelte';
import { test } from '../../test';

export default test({
	test({ assert, target }) {
		const [set, reset, y] = target.querySelectorAll('button');
		const p = target.querySelector('p');

		flushSync(() => set.click());
		assert.equal(p?.textContent, 'true true');

		flushSync(() => reset.click());
		assert.equal(p?.textContent, 'override');

		flushSync(() => set.click());
		assert.equal(p?.textContent, 'true true');

		flushSync(() => reset.click());
		flushSync(() => y.click());
		assert.equal(p?.textContent, 'false true');
	}
});
