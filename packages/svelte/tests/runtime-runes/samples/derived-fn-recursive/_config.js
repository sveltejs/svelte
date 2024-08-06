import { flushSync } from 'svelte';
import { test } from '../../test';

export default test({
	html: `<button>increment</button>\n0`,
	mode: ['client'],

	test({ assert, target, window }) {
		const btn = target.querySelector('button');
		let error;

		btn?.click();

		try {
			flushSync();
		} catch (e) {
			error = /** @type {Error} */ (e);
		}

		assert.equal(
			error?.message,
			'derived_referenced_self\nA derived value cannot not reference itself recursively.'
		);

		assert.htmlEqual(target.innerHTML, `<button>increment</button>\n0`);
	}
});
