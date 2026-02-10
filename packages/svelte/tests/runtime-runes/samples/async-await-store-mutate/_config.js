import { tick } from 'svelte';
import { test } from '../../test';

// ensure in-place object mutations stay reactive in async
export default test({
	skip_no_async: true,
	async test({ assert, target }) {
		const button = /** @type {HTMLElement} */ (target.querySelector('button'));

		await tick();

		assert.htmlEqual(target.innerHTML, `<p>count: 1, computed: 10</p><button>mutate</button>`);

		button.click();
		await tick();

		assert.htmlEqual(target.innerHTML, `<p>count: 2, computed: 20</p><button>mutate</button>`);

		button.click();
		await tick();

		assert.htmlEqual(target.innerHTML, `<p>count: 3, computed: 30</p><button>mutate</button>`);
	}
});
