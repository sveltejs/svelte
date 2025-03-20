import { flushSync } from 'svelte';
import { test } from '../../test';

export default test({
	test({ assert, target, logs }) {
		const button = target.querySelector('button');

		flushSync(() => button?.click());

		assert.htmlEqual(
			target.innerHTML,
			`
				<button>increment</button>
				<p>1/2</p
			`
		);

		assert.deepEqual(logs, [0, 0]);
	}
});
