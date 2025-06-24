import { settled } from 'svelte';
import { test } from '../../test';

export default test({
	async test({ assert, target, logs, variant }) {
		if (variant === 'hydrate') {
			await Promise.resolve();
		}

		const [reset, resolve] = target.querySelectorAll('button');

		reset.click();
		await settled();
		assert.deepEqual(logs, ['aborted']);

		resolve.click();
		await Promise.resolve();
		await Promise.resolve();
		await Promise.resolve();
		await Promise.resolve();
		await Promise.resolve();
		await Promise.resolve();
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
