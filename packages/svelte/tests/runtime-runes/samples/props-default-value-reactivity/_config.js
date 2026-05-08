import { flushSync, tick } from 'svelte';
import { test } from '../../test';

export default test({
	accessors: false,
	test({ assert, target }) {
		const btn = target.querySelector('button');

		btn?.click();
		flushSync();
		assert.htmlEqual(
			target.innerHTML,
			`
			<p>greeting: Hola</p>
			<button>Change Language</button>
			`
		);
	}
});
