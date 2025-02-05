import { flushSync } from 'svelte';
import { test } from '../../test';

export default test({
	async test({ assert, target, logs }) {
		const b1 = target.querySelector('button');

		b1?.click();
		flushSync();

		assert.htmlEqual(
			target.innerHTML,
			`<o>Store: new</o><p>Text: new message</p><button>Change Store</button>`
		);
	}
});
