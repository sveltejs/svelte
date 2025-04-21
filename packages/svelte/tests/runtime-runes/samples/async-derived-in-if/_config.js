import { flushSync } from 'svelte';
import { test } from '../../test';

export default test({
	async test({ assert, target }) {
		const button = target.querySelector('button');

		flushSync(() => button?.click());
		await Promise.resolve();
		await Promise.resolve();
		await Promise.resolve();
		await Promise.resolve();
		await Promise.resolve();
		await Promise.resolve();
		flushSync();

		assert.htmlEqual(
			target.innerHTML,
			`
				<button>show</button>
				<p>1</p>
			`
		);
	}
});
