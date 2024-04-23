import { flushSync } from 'svelte';
import { test } from '../../test';

export default test({
	html: `<button>Toggle</button><div>Hello\nworld</div>`,

	async test({ assert, target, logs }) {
		const [btn1] = target.querySelectorAll('button');

		flushSync(() => {
			btn1?.click();
		});

		assert.htmlEqual(target.innerHTML, `<button>Toggle</button>`);

		flushSync(() => {
			btn1?.click();
		});

		assert.htmlEqual(target.innerHTML, `<button>Toggle</button><div>Hello\nworld</div>`);

		assert.deepEqual(logs, [{ a: {} }, null, { a: {} }]);
	}
});
