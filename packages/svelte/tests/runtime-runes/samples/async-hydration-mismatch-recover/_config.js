import { flushSync, tick } from 'svelte';
import { test } from '../../test';

export default test({
	mode: ['hydrate'],

	async test({ assert, target, window, hydrate }) {
		// browser extensions like password managers insert elements next to inputs before hydration
		target.querySelector('input')?.after(window.document.createElement('extension-control'));

		hydrate();
		await tick();
		assert.htmlEqual(target.innerHTML, '<input> <button>clicks: 0</button>');

		target.querySelector('button')?.click();
		flushSync();
		assert.htmlEqual(target.innerHTML, '<input> <button>clicks: 1</button>');
	},

	warnings: [
		'Hydration failed because the initial UI does not match what was rendered on the server'
	]
});
