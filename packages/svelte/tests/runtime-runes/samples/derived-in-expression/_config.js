import { flushSync } from 'svelte';
import { test } from '../../test';

export default test({
	// In non-async mode we're not reacting to deriveds read in the same context they're defined in
	skip_no_async: true,
	test({ assert, target, logs }) {
		const [a, b] = target.querySelectorAll('button');

		flushSync(() => a?.click());
		assert.htmlEqual(
			target.innerHTML,
			`
				<button>a</button>
				<button>b</button>
				<p>1/0</p
			`
		);

		flushSync(() => a?.click());
		assert.htmlEqual(
			target.innerHTML,
			`
				<button>a</button>
				<button>b</button>
				<p>2/0</p
			`
		);

		flushSync(() => b?.click());
		assert.htmlEqual(
			target.innerHTML,
			`
				<button>a</button>
				<button>b</button>
				<p>2/1</p
			`
		);

		flushSync(() => b?.click());
		assert.htmlEqual(
			target.innerHTML,
			`
				<button>a</button>
				<button>b</button>
				<p>2/2</p
			`
		);

		assert.deepEqual(logs, [
			// init
			'a',
			'b',
			'effect a',
			'effect b',
			// click a
			'a',
			'effect a',
			// click a
			'a',
			'effect a',
			// click b
			'a',
			'b',
			'effect a',
			'effect b',
			// click b
			'a',
			'b',
			'effect a',
			'effect b'
		]);
	}
});
