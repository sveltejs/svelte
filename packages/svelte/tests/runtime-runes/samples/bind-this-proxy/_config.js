import { flushSync } from 'svelte';
import { test } from '../../test';

export default test({
	compileOptions: {
		// override process.env.HMR — this test only passes in prod mode, because in dev we add `$destroy` methods etc
		dev: false
	},

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
