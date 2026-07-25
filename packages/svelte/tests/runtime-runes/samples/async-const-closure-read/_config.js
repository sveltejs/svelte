import { tick } from 'svelte';
import { test } from '../../test';

// same fix as async-declaration-closure-read, via the shared helpers — an `{@const}`
// reading an async value inside a closure must block on it
export default test({
	async test({ assert, target }) {
		await tick();
		assert.htmlEqual(target.innerHTML, '<p>true</p> <p>false</p>');
	}
});
