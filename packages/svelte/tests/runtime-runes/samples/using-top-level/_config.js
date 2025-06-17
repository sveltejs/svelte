import { flushSync } from 'svelte';
import { test } from '../../test';

export default test({
	// TODO unskip this for applicable node versions, once supported
	skip: true,

	html: `<button>toggle</button><p>hello</p>`,

	test({ assert, target, logs }) {
		const [button] = target.querySelectorAll('button');

		flushSync(() => button.click());
		assert.htmlEqual(target.innerHTML, `<button>toggle</button>`);

		assert.deepEqual(logs, ['disposing hello']);
	}
});
