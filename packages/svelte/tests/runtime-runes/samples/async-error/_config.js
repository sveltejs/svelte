import { flushSync, tick } from 'svelte';
import { test } from '../../test';

export default test({
	html: `<button>step 1</button><button>step 2</button><button>step 3</button><p>pending</p>`,

	async test({ assert, target }) {
		let [button1, button2, button3] = target.querySelectorAll('button');

		flushSync(() => button1.click());
		await Promise.resolve();
		await Promise.resolve();
		flushSync();
		assert.htmlEqual(
			target.innerHTML,
			'<button>step 1</button><button>step 2</button><button>step 3</button><p>oops!</p><button>reset</button>'
		);

		flushSync(() => button2.click());
		assert.htmlEqual(
			target.innerHTML,
			'<button>step 1</button><button>step 2</button><button>step 3</button><p>pending</p>'
		);

		flushSync(() => button3.click());
		await Promise.resolve();
		await tick();
		assert.htmlEqual(
			target.innerHTML,
			'<button>step 1</button><button>step 2</button><button>step 3</button><h1>wheee</h1>'
		);
	}
});
