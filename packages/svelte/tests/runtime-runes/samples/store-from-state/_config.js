import { flushSync } from 'svelte';
import { test } from '../../test';

export default test({
	test({ assert, target }) {
		const button = target.querySelector('button');

		flushSync(() => {
			button?.click();
			button?.click();
			button?.click();
		});
		assert.htmlEqual(target.innerHTML, `\n3\n<button>Increment</button><br>`);
	}
});
