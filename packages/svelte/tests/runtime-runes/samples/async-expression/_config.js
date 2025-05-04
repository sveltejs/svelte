import { flushSync, tick } from 'svelte';
import { deferred } from '../../../../src/internal/shared/utils.js';
import { test } from '../../test';

/** @type {ReturnType<typeof deferred>} */
let d;

export default test({
	html: `
		<button>reset</button>
		<button>hello</button>
		<button>goodbye</button>
		<p>pending</p>
	`,

	async test({ assert, target }) {
		const [reset, hello, goodbye] = target.querySelectorAll('button');

		flushSync(() => hello.click());
		await Promise.resolve();
		await Promise.resolve();
		await tick();
		flushSync();
		assert.htmlEqual(
			target.innerHTML,
			`
				<button>reset</button>
				<button>hello</button>
				<button>goodbye</button>
				<h1>hello</h1>
			`
		);

		flushSync(() => reset.click());
		await tick();
		assert.htmlEqual(
			target.innerHTML,
			`
				<button>reset</button>
				<button>hello</button>
				<button>goodbye</button>
				<h1>hello</h1>
			`
		);

		flushSync(() => goodbye.click());
		await tick();
		assert.htmlEqual(
			target.innerHTML,
			`
				<button>reset</button>
				<button>hello</button>
				<button>goodbye</button>
				<h1>goodbye</h1>
			`
		);
	}
});
