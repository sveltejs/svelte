import { flushSync } from 'svelte';
import { test } from '../../test';

export default test({
	html: `<button>10</button>`,
	ssrHtml: `<button>0</button>`,

	async test({ assert, target }) {
		flushSync();

		assert.htmlEqual(target.innerHTML, `<button>10</button>`);
	}
});
