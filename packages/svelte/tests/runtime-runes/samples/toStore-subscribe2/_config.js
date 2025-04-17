import { flushSync } from 'svelte';
import { test } from '../../test';

export default test({
	async test({ assert, target }) {
		let btn = target.querySelector('button');

		btn?.click();
		flushSync();

		assert.htmlEqual(
			target.innerHTML,
			`<div>Count 1!</div><div>Count from store 1!</div><button>Add 1</button>`
		);
	}
});
