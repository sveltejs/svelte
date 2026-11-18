import { flushSync, tick } from 'svelte';
import { test } from '../../test';

export default test({
	mode: ['hydrate'],

	async test({ assert, target, window, hydrate }) {
		const [before, after] = target.querySelectorAll('p');
		target.querySelector('input')?.after(window.document.createElement('extension-control'));

		hydrate();
		await tick();
		assert.htmlEqual(
			target.innerHTML,
			'<p>before</p> <input> <button>clicks: 0</button> <p>after</p>'
		);

		// content outside the block is hydrated, not re-rendered
		assert.deepEqual([...target.querySelectorAll('p')], [before, after]);

		target.querySelector('button')?.click();
		flushSync();
		assert.htmlEqual(
			target.innerHTML,
			'<p>before</p> <input> <button>clicks: 1</button> <p>after</p>'
		);
	},

	warnings: [
		'Hydration failed because the initial UI does not match what was rendered on the server'
	]
});
