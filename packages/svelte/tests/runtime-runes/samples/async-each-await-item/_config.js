import { flushSync, tick } from 'svelte';
import { test } from '../../test';

export default test({
	html: `<button>step 1</button><button>step 2</button><button>step 3</button><p>pending</p>`,

	async test({ assert, target }) {
		const [button1, button2, button3] = target.querySelectorAll('button');

		flushSync(() => button1.click());
		await Promise.resolve();
		await Promise.resolve();
		await tick();
		flushSync();
		assert.htmlEqual(
			target.innerHTML,
			'<button>step 1</button><button>step 2</button><button>step 3</button><p>a</p><p>b</p><p>c</p>'
		);

		flushSync(() => button2.click());
		await tick();
		assert.htmlEqual(
			target.innerHTML,
			'<button>step 1</button><button>step 2</button><button>step 3</button><p>a</p><p>b</p><p>c</p>'
		);

		flushSync(() => button3.click());
		await Promise.resolve();
		await tick();
		assert.htmlEqual(
			target.innerHTML,
			'<button>step 1</button><button>step 2</button><button>step 3</button><p>b</p><p>c</p><p>d</p><p>e</p>'
		);
	}
});
