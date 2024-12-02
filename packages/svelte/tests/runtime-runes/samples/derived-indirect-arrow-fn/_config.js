import { flushSync } from 'svelte';
import { test } from '../../test';

export default test({
	html: `<button>0</button>`,

	async test({ assert, target, window }) {
		const btn = target.querySelector('button');
		const clickEvent = new window.Event('click', { bubbles: true });
		btn?.dispatchEvent(clickEvent);
		flushSync();

		assert.htmlEqual(target.innerHTML, `<button>2</button>`);
	}
});
