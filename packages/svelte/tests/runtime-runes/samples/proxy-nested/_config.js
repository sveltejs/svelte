import { flushSync } from 'svelte';
import { test } from '../../test';

export default test({
	html: `<button>clicks: 0/0</button>`,

	test({ assert, target }) {
		const btn = target.querySelector('button');

		flushSync(() => {
			btn?.click();
		});

		assert.htmlEqual(target.innerHTML, `<button>clicks: 0/1</button>`);
	}
});
