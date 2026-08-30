import { flushSync } from 'svelte';
import { test } from '../../test';

export default test({
	mode: ['client', 'hydrate'],

	test({ assert, target }) {
		const button = target.querySelector('button');

		flushSync(() => button?.click());

		assert.htmlEqual(
			target.innerHTML,
			'<button>show</button> <div data-attached="true">content</div>'
		);
	}
});
