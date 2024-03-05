import { flushSync } from 'svelte';
import { test } from '../../test';

export default test({
	html: `100\n<button>Update</button>`,

	async test({ assert, target }) {
		/**
		 * @type {{ click: () => void; }}
		 */
		let btn1;

		[btn1] = target.querySelectorAll('button');

		flushSync(() => {
			btn1.click();
		});

		assert.htmlEqual(target.innerHTML, `1000\n<button>Update</button>`);
	}
});
