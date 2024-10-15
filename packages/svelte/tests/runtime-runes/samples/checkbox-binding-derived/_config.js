import { flushSync } from 'svelte';
import { test } from '../../test';

export default test({
	async test({ assert, target }) {
		const button = target.querySelector('button');

		button?.click();
		flushSync();

		assert.htmlEqual(
			target.innerHTML,
			`<button>Add</button><label><input type="checkbox">\n1</label><label><input type="checkbox">\nfoo</label>`
		);
	}
});
