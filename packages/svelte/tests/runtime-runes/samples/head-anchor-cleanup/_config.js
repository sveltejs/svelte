import { flushSync } from 'svelte';
import { test } from '../../test';

export default test({
	test({ assert, target }) {
		const head = target.ownerDocument.head;
		const initial = head.childNodes.length;
		const button = target.querySelector('button');

		// repeated mount/unmount must not accumulate anchor text nodes in <head>
		for (let i = 0; i < 3; i++) {
			button?.click();
			flushSync();
			button?.click();
			flushSync();
		}

		assert.equal(head.childNodes.length, initial);
	}
});
