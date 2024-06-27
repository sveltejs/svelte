import { flushSync } from 'svelte';
import { test } from '../../test';

export default test({
	html: `<button>Add new message</button><p>first</p><p>message 1</p>`,

	async test({ assert, target }) {
		/**
		 * @type {{ click: () => void; }}
		 */
		let btn1;

		[btn1] = target.querySelectorAll('button');

		flushSync(() => {
			btn1.click();
		});

		assert.htmlEqual(
			target.innerHTML,
			`<button>Add new message</button><p>first</p><p>message 1</p><p>message 2</p>`
		);

		await Promise.resolve();

		assert.htmlEqual(
			target.innerHTML,
			`<button>Add new message</button><p>first</p><p>message 1</p><p>message 2</p>`
		);

		flushSync(() => {
			btn1.click();
		});

		await Promise.resolve();

		assert.htmlEqual(
			target.innerHTML,
			`<button>Add new message</button><p>first</p><p>message 1</p><p>message 2</p><p>message 3</p>`
		);
	}
});
