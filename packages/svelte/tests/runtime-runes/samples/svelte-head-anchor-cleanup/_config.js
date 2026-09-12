import { flushSync } from 'svelte';
import { ok, test } from '../../test';

export default test({
	mode: ['client', 'hydrate'],

	test({ assert, target, window }) {
		const initial = window.document.head.childNodes.length;
		const button = target.querySelector('button');
		ok(button);

		for (let i = 0; i < 3; i++) {
			flushSync(() => button.click());
			flushSync(() => button.click());
		}

		assert.equal(window.document.head.childNodes.length, initial);
	}
});
