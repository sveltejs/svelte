import { flushSync } from 'svelte';
import { test } from '../../test';

export default test({
	ssrHtml: '<button>clear</button><p></p>',
	html: '<button>clear</button><p>HELLO</p>',

	async test({ assert, target }) {
		const [button] = target.querySelectorAll('button');

		flushSync(() => button.click());

		assert.htmlEqual(target.innerHTML, '<button>clear</button><p></p>');
	}
});
