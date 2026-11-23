import { tick } from 'svelte';
import { test } from '../../test';

/** @type {string[]} */
const written = [];

/** @type {MutationObserver | undefined} */
let observer;

export default test({
	mode: ['hydrate'],

	server_props: { n: 1, m: 1 },
	props: { n: 1, m: 2 },

	before_test() {
		observer?.disconnect();
		written.length = 0;
		observer = new MutationObserver((records) => {
			for (const record of records) written.push(/** @type {string} */ (record.attributeName));
		});
		observer.observe(document.body, { attributes: true, subtree: true });
	},

	async test({ assert, target }) {
		await tick();
		observer?.disconnect();

		// the `{#if}` is hydrated once its condition resolves; an awaited value is applied after hydration
		assert.deepEqual(written.sort(), ['data-deferred', 'data-m']);
		assert.htmlEqual(
			target.innerHTML,
			'<div data-n="1" data-m="2"></div> <p data-deferred="1"></p>'
		);
	}
});
