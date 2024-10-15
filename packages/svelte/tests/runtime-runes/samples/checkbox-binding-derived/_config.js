import { flushSync } from 'svelte';
import { test } from '../../test';

export default test({
	async test({ assert, target }) {
		const button = target.querySelector('button');

		button?.click();
		flushSync();

		assert.htmlEqual(
			target.innerHTML,
			`<button>Add</button><label><input type="checkbox"></label><label><input type="checkbox"></label>`
		);
	}
});
