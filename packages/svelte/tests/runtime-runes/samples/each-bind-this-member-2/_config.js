import { flushSync } from 'svelte';
import { test } from '../../test';

export default test({
	async test({ assert, target, component }) {
		const [b1, b2] = target.querySelectorAll('button');

		flushSync(() => {
			b1.click();
			b1.click();
			b1.click();
		});

		assert.htmlEqual(
			target.innerHTML,
			`<button>add item</button><button>clear</button><div>Item 1</div><div>Item 2</div><div>Item 3</div>`
		);

		flushSync(() => {
			b2.click();
		});

		assert.htmlEqual(target.innerHTML, `<button>add item</button><button>clear</button>`);
	}
});
