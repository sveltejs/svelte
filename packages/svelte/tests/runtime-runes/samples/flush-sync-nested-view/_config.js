import { flushSync } from 'svelte';
import { test } from '../../test';

// Test that a flushSync inside an effect restores the correct context afterwards to correctly continue the outer flush afterwards
export default test({
	mode: ['client', 'hydrate'],
	test({ assert, target, logs }) {
		assert.deepEqual(logs, ['read 0:0']);
		logs.length = 0;

		flushSync(() => target.querySelector('button')?.click());

		// The reader must wait for the new batch to update the DOM.
		assert.deepEqual(logs, ['write', 'tail', 'read 1:1']);
		assert.htmlEqual(target.innerHTML, '<button>go</button><span>1</span>');
	}
});
