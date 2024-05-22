import { flushSync } from 'svelte';
import { test } from '../../test';

export default test({
	html: `<button>1 / false</button>`,

	test({ assert, target, window }) {
		const btn = target.querySelector('button');
		const clickEvent = new window.Event('click', { bubbles: true });

		btn?.dispatchEvent(clickEvent);
		flushSync();
		assert.htmlEqual(target.innerHTML, `<button>1 / true</button>`);

		btn?.dispatchEvent(clickEvent);
		flushSync();
		assert.htmlEqual(target.innerHTML, `<button>1 / false</button>`);
	}
});
