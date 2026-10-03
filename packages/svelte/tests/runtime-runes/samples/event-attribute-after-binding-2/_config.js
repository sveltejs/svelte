import { flushSync } from 'svelte';
import { test } from '../../test';

export default test({
	test({ assert, target }) {
		const details = /** @type {HTMLDetailsElement} */ (target.querySelector('details'));
		const p = target.querySelector('p');

		details.open = true;
		details.dispatchEvent(new Event('toggle'));
		flushSync();

		assert.htmlEqual(p?.innerHTML ?? '', 'true true');
	}
});
