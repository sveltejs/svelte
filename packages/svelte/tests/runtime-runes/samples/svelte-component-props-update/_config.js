import { flushSync } from 'svelte';
import { test } from '../../test';

export default test({
	async test({ assert, target }) {
		const [btn] = target.querySelectorAll('button');
		btn.click();
		flushSync();
		assert.htmlEqual(target.innerHTML, `<button>Change</button> <p>Comp 2</p>`);
	}
});
