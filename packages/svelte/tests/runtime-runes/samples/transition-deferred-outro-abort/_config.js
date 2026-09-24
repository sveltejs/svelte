import { flushSync } from 'svelte';
import { test } from '../../test';

export default test({
	test({ assert, target }) {
		const button = target.querySelector('button');

		button.click();
		flushSync();

		// the outro is aborted and the branch stays visible, without throwing
		assert.htmlEqual(target.innerHTML, `<button>Reproduce</button> <p>Deferred outro</p>`);
	}
});
