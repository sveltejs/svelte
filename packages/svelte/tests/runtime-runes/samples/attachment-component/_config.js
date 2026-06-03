import { flushSync } from 'svelte';
import { test } from '../../test';

export default test({
	ssrHtml: `<button>update</button><div></div>`,
	html: `<button>update</button><div>one</div>`,

	test({ target, assert }) {
		const button = target.querySelector('button');

		flushSync(() => button?.click());
		assert.htmlEqual(target.innerHTML, '<button>update</button><div>two</div>');
	}
});
