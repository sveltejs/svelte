import { flushSync } from 'svelte';
import { test } from '../../test';

export default test({
	html: `<button>0</button>`,

	test({ assert, target, logs }) {
		const btn = target.querySelector('button');

		btn?.click();
		flushSync();
		assert.htmlEqual(target.innerHTML, `<button>1</button>`);

		btn?.click();
		flushSync();
		assert.htmlEqual(target.innerHTML, `<button>2</button>`);

		assert.deepEqual(logs, [100]);
	}
});
