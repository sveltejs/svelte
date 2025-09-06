import { flushSync } from 'svelte';
import { test } from '../../test';

export default test({
	html: '',

	test({ assert, target }) {
		flushSync();
		assert.htmlEqual(target.innerHTML, `<p>connected: true</p><p>disposed: true</p>`);
	}
});
