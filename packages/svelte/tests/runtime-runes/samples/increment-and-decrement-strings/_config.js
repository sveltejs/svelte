import { flushSync } from 'svelte';
import { test } from '../../test';

export default test({
	html: `
		<button>update</button>
		<p>0, 0, 0, 0</p>
	`,

	test({ target, assert, logs }) {
		const btn = target.querySelector('button');
		flushSync(() => btn?.click());

		assert.htmlEqual(
			target.innerHTML,
			`
				<button>update</button>
				<p>1, -1, 1, -1</p>
			`
		);

		assert.deepEqual(logs, [0, 0, 1, -1]);
	}
});
