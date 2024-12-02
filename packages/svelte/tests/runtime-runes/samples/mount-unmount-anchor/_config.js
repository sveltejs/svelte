import { flushSync } from 'svelte';
import { test } from '../../test';

export default test({
	test({ assert, target }) {
		const btn = target.querySelector('button');
		btn?.click();
		flushSync();
		btn?.click();
		flushSync();
		btn?.click();
		flushSync();
		btn?.click();
		flushSync();
		btn?.click();
		flushSync();

		const div = target.querySelector('div');

		assert.htmlEqual(target.innerHTML, '<button>generate</button><div></div>');
		assert.equal(div?.childNodes.length, 0);
	}
});
