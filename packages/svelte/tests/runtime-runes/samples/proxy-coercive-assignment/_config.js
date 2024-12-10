import { flushSync } from 'svelte';
import { test } from '../../test';

export default test({
	html: `<button>items: null</button>`,

	test({ assert, target }) {
		const [btn1] = target.querySelectorAll('button');

		flushSync(() => btn1.click());
		assert.htmlEqual(target.innerHTML, `<button>items: [0]</button>`);

		flushSync(() => btn1.click());
		assert.htmlEqual(target.innerHTML, `<button>items: [0,1]</button>`);
	}
});
