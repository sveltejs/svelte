import { tick } from 'svelte';
import { test } from '../../test';

// #18469 — a sync $derived in a nested snippet reading an async declaration through a closure must block on it
export default test({
	async test({ assert, target }) {
		await tick();
		assert.htmlEqual(target.innerHTML, '<p>true</p> <p>false</p>');
	}
});
