import { flushSync } from 'svelte';
import { test } from '../../test';

export default test({
	html: `<div><button>0 0</button>`,

	async test({ assert, target }) {
		const button1 = target.querySelector('button');

		flushSync(() => button1?.click());
		assert.htmlEqual(target.innerHTML, `<div><button>1 1</button></div>`);
	},

	runtime_error: 'nope'
});
