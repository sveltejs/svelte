import { flushSync } from 'svelte';
import { test } from '../../test';

export default test({
	async test({ assert, target }) {
		const btn = target.querySelector('button');

		btn?.click();
		flushSync();
		assert.htmlEqual(
			target.innerHTML,
			`
			<button>inc</button>
			<p>a:1</p>
			<p>b:2</p>
			<p>c:3</p>
			`
		);
	}
});
