import { flushSync } from 'svelte';
import { test } from '../../test';

export default test({
	html: `<button>a</button><button>b</button><div>a</div>`,
	compileOptions: {
		dev: false
	},

	async test({ assert, target, logs, ok }) {
		const [btn1, btn2] = target.querySelectorAll('button');

		flushSync(() => {
			btn2.click();
		});

		assert.htmlEqual(target.innerHTML, `<button>a</button><button>b</button><div>b</div>`);

		flushSync(() => {
			btn1.click();
		});

		assert.htmlEqual(target.innerHTML, `<button>a</button><button>b</button><div>a</div>`);
		assert.deepEqual(logs, [{ a: {} }, {}, { a: {} }]);
	}
});
