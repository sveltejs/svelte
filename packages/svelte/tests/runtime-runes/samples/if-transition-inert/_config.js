import { flushSync } from 'svelte';
import { test } from '../../test';

export default test({
	html: `<button>hide</button><div>hello</div>`,

	async test({ assert, target }) {
		const [btn1, btn2] = target.querySelectorAll('button');

		flushSync(() => {
			btn1.click();
		});

		assert.htmlEqual(target.innerHTML, `<button>hide</button><div style="opacity: 0;">hello</div>`);
	}
});
