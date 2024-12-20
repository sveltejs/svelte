import { flushSync } from 'svelte';
import { test } from '../../test';

export default test({
	ssrHtml: `<div></div><button>increment</button>`,
	html: `<div>1</div><button>increment</button>`,

	test: ({ assert, target }) => {
		const btn = target.querySelector('button');

		flushSync(() => btn?.click());
		assert.htmlEqual(target.innerHTML, `<div>2</div><button>increment</button>`);
	}
});
