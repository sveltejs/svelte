import { flushSync } from 'svelte';
import { test } from '../../test';

export default test({
	test({ assert, target }) {
		const [i1, i2] = target.querySelectorAll('input');

		i1?.click();
		flushSync();

		assert.htmlEqual(
			target.innerHTML,
			'true true <input type="checkbox"> false false <input type="checkbox">'
		);

		i2?.click();
		flushSync();

		assert.htmlEqual(
			target.innerHTML,
			'true true <input type="checkbox"> true true <input type="checkbox">'
		);
	}
});
