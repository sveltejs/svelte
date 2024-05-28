import { flushSync } from 'svelte';
import { test } from '../../test';

export default test({
	test({ assert, target, ok }) {
		const button = target.querySelector('button');

		flushSync(() => {
			button?.click();
		});
		assert.htmlEqual(
			target.innerHTML,
			`
			<button>1</button>
		`
		);
	}
});
