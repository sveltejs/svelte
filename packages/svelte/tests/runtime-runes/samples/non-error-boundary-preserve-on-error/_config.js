import { test } from '../../test';
import { flushSync } from 'svelte';

export default test({
	test({ assert, target }) {
		const [button] = target.querySelectorAll('button');

		assert.throws(() => {
			flushSync(() => button.click());
		}, /oops/);

		assert.htmlEqual(
			target.innerHTML,
			`
				<button>throw</button>
				<p>some content</p>
			`
		);
	}
});
