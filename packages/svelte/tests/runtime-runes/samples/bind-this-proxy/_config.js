import { flushSync } from 'svelte';
import { test } from '../../test';
import { log } from './log.js';

export default test({
	before_test: () => {
		log.length = 0;
	},

	html: `<button>Toggle</button><div>Hello\nworld</div>`,

	async test({ assert, target }) {
		const [btn1] = target.querySelectorAll('button');

		flushSync(() => {
			btn1?.click();
		});

		assert.htmlEqual(target.innerHTML, `<button>Toggle</button>`);

		flushSync(() => {
			btn1?.click();
		});

		assert.htmlEqual(target.innerHTML, `<button>Toggle</button><div>Hello\nworld</div>`);

		assert.deepEqual(log, [{ a: {} }, null, { a: {} }]);
	}
});
