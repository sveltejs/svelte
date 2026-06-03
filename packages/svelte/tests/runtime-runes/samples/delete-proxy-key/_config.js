import { test } from '../../test';
import { flushSync } from 'svelte';

export default test({
	html: `<button>delete</button><p>test</p>`,

	async test({ assert, target }) {
		const btn = target.querySelector('button');

		flushSync(() => btn?.click());
		assert.htmlEqual(target.innerHTML, '<button>delete</button>');
	}
});
