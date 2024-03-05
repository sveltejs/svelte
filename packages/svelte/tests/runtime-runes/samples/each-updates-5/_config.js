import { flushSync } from 'svelte';
import { test } from '../../test';

export default test({
	html: `1\n1\n1\n1\n<button>+</button>`,

	async test({ assert, target }) {
		/**
		 * @type {{ click: () => void; }}
		 */
		let btn1;

		[btn1] = target.querySelectorAll('button');

		flushSync(() => {
			btn1.click();
		});

		assert.htmlEqual(target.innerHTML, `2\n2\n2\n2\n<button>+</button>`);
	}
});
