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
		assert.htmlEqual(target.innerHTML, `<div>3</div><div>3,  6</div><button>increment</button>`);
	}
});
