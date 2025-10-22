import { flushSync } from 'svelte';
import { test } from '../../test';

export default test({
	html: `<button>show</button><button>animate</button>`,

	async test({ assert, target }) {
		const [btn1, btn2] = target.querySelectorAll('button');

		flushSync(() => {
			btn1.click();
		});

		assert.htmlEqual(
			target.innerHTML,
			`<button>show</button><button>animate</button><h1>Hello\n!</h1>`
		);

		flushSync(() => {
			btn1.click();
		});

		assert.htmlEqual(target.innerHTML, `<button>show</button><button>animate</button>`);

		flushSync(() => {
			btn2.click();
		});

		assert.htmlEqual(target.innerHTML, `<button>show</button><button>animate</button>`);

		flushSync(() => {
			btn1.click();
		});

		assert.htmlEqual(
			target.innerHTML,
			`<button>show</button><button>animate</button><h1 style="opacity: 0;">Hello\n!</h1>`
		);
	}
});
