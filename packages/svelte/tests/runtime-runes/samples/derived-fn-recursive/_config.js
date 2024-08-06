import { flushSync } from 'svelte';
import { test } from '../../test';

export default test({
	html: `<button>increment</button>\n0`,

	mode: ['client'],

	test({ assert, target }) {
		const btn = target.querySelector('button');

		btn?.click();

		assert.throws(
			flushSync,
			'derived_referenced_self\nA derived value cannot not reference itself recursively'
		);

		assert.htmlEqual(target.innerHTML, `<button>increment</button>\n0`);
	}
});
