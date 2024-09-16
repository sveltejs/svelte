import { flushSync } from 'svelte';
import { test } from '../../test';

export default test({
	async test({ assert, target }) {
		const [b1] = target.querySelectorAll('button');
		b1.click();
		flushSync();
		assert.htmlEqual(target.innerHTML, `<button>Replace</button>\n9,10,11`);
	}
});
