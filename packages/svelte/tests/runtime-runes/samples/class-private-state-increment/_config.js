import { flushSync } from 'svelte';
import { test } from '../../test';

export default test({
	html: `<button>1</button>`,

	test({ assert, target }) {
		const btn = target.querySelector('button');

		btn?.click();
		flushSync();
		assert.htmlEqual(target.innerHTML, `<button>2</button>`);

		btn?.click();
		flushSync();
		assert.htmlEqual(target.innerHTML, `<button>4</button>`);
	}
});
