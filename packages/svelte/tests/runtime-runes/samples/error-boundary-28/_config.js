import { flushSync, tick } from 'svelte';
import { test } from '../../test';

export default test({
	// Regression test for https://github.com/sveltejs/svelte/issues/18485.
	// A $derived that re-executes and throws during teardown should route the
	// error to a live ancestor boundary.
	mode: ['client'],
	async test({ assert, target }) {
		const [break_it, unmount] = target.querySelectorAll('button');

		break_it.click();
		flushSync();

		assert.doesNotThrow(() => {
			unmount.click();
			flushSync();
		});

		await tick();
		assert.htmlEqual(target.innerHTML, '<p>caught</p>');
	}
});
