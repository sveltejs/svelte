import { flushSync } from 'svelte';
import { test } from '../../test';

export default test({
	test({ assert, target }) {
		const button = target.querySelector('button');

		assert.htmlEqual(target.innerHTML, `<div></div><button data-foo="true">inc</button> 12 - 12`);
		flushSync(() => button?.click());
		assert.htmlEqual(target.innerHTML, `<div></div><button data-foo="true">inc</button> 13 - 12`);
	}
});
