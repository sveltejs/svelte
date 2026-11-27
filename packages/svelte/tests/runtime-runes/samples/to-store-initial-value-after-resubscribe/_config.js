import { flushSync } from 'svelte';
import { test } from '../../test';

export default test({
	mode: ['client'],

	test({ assert, target }) {
		const [read, one, zero] = target.querySelectorAll('button');
		const [output] = target.querySelectorAll('output');

		// every `get(store)` subscribes and unsubscribes again
		read.click();
		flushSync();
		assert.htmlEqual(output.innerHTML, '0');

		one.click();
		flushSync();
		read.click();
		flushSync();
		assert.htmlEqual(output.innerHTML, '1');

		// the value returns to the one `toStore` was created with
		zero.click();
		flushSync();
		read.click();
		flushSync();
		assert.htmlEqual(output.innerHTML, '0');
	}
});
