import { flushSync } from 'svelte';
import { test } from '../../test';

export default test({
	html: `<button>10: 20</button>`,

	test({ assert, target }) {
		const btn = target.querySelector('button');

		flushSync(() => {
			btn?.click();
		});
		assert.htmlEqual(target.innerHTML, `<button>11: 22</button>`);

		flushSync(() => {
			btn?.click();
		});
		assert.htmlEqual(target.innerHTML, `<button>12: 24</button>`);
	}
});
