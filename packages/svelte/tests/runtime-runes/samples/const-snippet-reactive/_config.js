import { flushSync } from 'svelte';
import { test } from '../../test';

export default test({
	async test({ assert, target }) {
		const btn = target.querySelector('button');
		flushSync(() => btn?.click());
		assert.htmlEqual(target.innerHTML, `<button></button><p>snip</p>`);
	}
});
