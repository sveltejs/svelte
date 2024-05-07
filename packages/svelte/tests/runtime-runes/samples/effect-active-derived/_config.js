import { flushSync } from 'svelte';
import { test } from '../../test';

export default test({
	html: `<button>toggle (false)</button>`,

	test({ assert, target }) {
		const btn = target.querySelector('button');
		flushSync(() => btn?.click());

		assert.htmlEqual(target.innerHTML, `<button>toggle (true)</button><p>bar is true</p>`);
	}
});
