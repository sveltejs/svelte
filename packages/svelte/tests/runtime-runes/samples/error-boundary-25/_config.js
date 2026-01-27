import { flushSync } from 'svelte';
import { test } from '../../test';

export default test({
	mode: ['client'],
	test({ assert, target }) {
		flushSync();

		// When exception is set by onerror, the {#if !exception} block should hide
		// and only the {#if exception} block should be visible
		assert.htmlEqual(target.innerHTML, '<p>caught error: child error</p>');
	}
});
