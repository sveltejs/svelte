import { tick } from 'svelte';
import { test } from '../../test';

export default test({
	mode: ['hydrate'],

	async test({ assert, target, window, logs, hydrate }) {
		target.querySelector('input')?.after(window.document.createElement('extension-control'));

		hydrate();
		await tick();
		assert.htmlEqual(target.innerHTML, '<span>child</span> <input> <p>after</p>');

		// the effects created by the failed attempt never run, and its head content is removed
		assert.deepEqual(logs, ['mount', 'effect']);
		assert.equal(window.document.head.querySelectorAll('meta[name="child"]').length, 1);
	},

	warnings: [
		'Hydration failed because the initial UI does not match what was rendered on the server'
	]
});
