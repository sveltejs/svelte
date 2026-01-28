import { flushSync } from 'svelte';
import { test } from '../../test';

export default test({
	test({ target, logs, assert }) {
		const [div, div2] = target.querySelectorAll('div');
		const button = target.querySelector('button');

		assert.deepEqual(logs, ['called', 'called']);

		// this is to assert that the order of the attributes is still not relevant
		// and directives take precedence over generic attribute
		assert.equal(div.classList.contains('dark'), false);
		assert.equal(div2.style.color, 'red');

		flushSync(() => button?.click());
		assert.deepEqual(logs, ['called', 'called']);
	}
});
