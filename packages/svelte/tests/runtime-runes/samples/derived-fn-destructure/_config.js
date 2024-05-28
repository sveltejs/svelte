import { flushSync } from 'svelte';
import { test } from '../../test';

export default test({
	mode: ['server'],
	html: `<button>0</button>`,

	test({ assert, target, window, logs }) {
		const btn = target.querySelector('button');
		const clickEvent = new window.Event('click', { bubbles: true });
		btn?.dispatchEvent(clickEvent);
		flushSync();

		assert.htmlEqual(target.innerHTML, `<button>2</button>`);
		assert.deepEqual(logs, ['create_derived']);
	}
});
