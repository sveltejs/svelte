import { flushSync } from 'svelte';
import { test } from '../../test';

export default test({
	mode: ['client'],
	test({ assert, target }) {
		flushSync();

		assert.htmlEqual(target.innerHTML, '<p>error occurred</p>');
	}
});
