import { flushSync } from 'svelte';
import { test } from '../../test';

export default test({
	// In async mode we _do_ want to run effects that react to their own state changing
	skip_async: true,
	test({ assert, target, logs }) {
		const button = target.querySelector('button');

		flushSync(() => button?.click());

		assert.htmlEqual(
			target.innerHTML,
			`
				<button>increment</button>
				<p>1/2</p>
				<p>1/2</p>
			`
		);

		assert.deepEqual(logs, [0, 0, 0, 0]);
	}
});
