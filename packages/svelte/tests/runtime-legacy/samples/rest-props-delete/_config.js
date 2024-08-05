import { flushSync } from 'svelte';
import { test } from '../../test';

export default test({
	html: `<button>delete a</button>\n{"a":1,"b":2}`,

	test({ assert, target }) {
		const [btn1] = target.querySelectorAll('button');

		btn1.click();
		flushSync();

		assert.htmlEqual(target.innerHTML, `<button>delete a</button>\n{"b":2}`);
	}
});
