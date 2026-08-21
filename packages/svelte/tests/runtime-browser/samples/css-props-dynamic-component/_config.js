import { test } from '../../assert';
import { flushSync } from 'svelte';

export default test({
	warnings: [],
	async test({ assert, target }) {
		const btn = target.querySelector('button');
		let div = /** @type {HTMLElement} */ (target.querySelector('div'));
		assert.equal(getComputedStyle(div).color, 'rgb(255, 0, 0)');
		flushSync(() => {
			btn?.click();
		});
		div = /** @type {HTMLElement} */ (target.querySelector('div'));
		assert.equal(getComputedStyle(div).color, 'rgb(255, 0, 0)');
	}
});
