import { flushSync, tick } from 'svelte';
import { test } from '../../test';

export default test({
	async test({ assert, target, logs, variant }) {
		if (variant === 'hydrate') {
			await Promise.resolve();
		}

		const [reset, resolve] = target.querySelectorAll('button');

		flushSync(() => reset.click());
		await Promise.resolve();
		await Promise.resolve();
		await Promise.resolve();
		await Promise.resolve();
		await Promise.resolve();
		await Promise.resolve();
		await tick();
		assert.deepEqual(logs, ['aborted']);

		flushSync(() => resolve.click());
		await Promise.resolve();
		await Promise.resolve();
		await Promise.resolve();
		await Promise.resolve();
		await tick();
		assert.htmlEqual(
			target.innerHTML,
			`
				<button>reset</button>
				<button>resolve</button>
				<h1>hello</h1>
			`
		);
	}
});
