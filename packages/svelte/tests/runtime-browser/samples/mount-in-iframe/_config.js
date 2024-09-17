import { flushSync } from 'svelte';
import { test } from '../../assert';

export default test({
	async test({ target, assert }) {
		const button = target.querySelector('button');
		const h1 = () =>
			/** @type {HTMLHeadingElement} */ (
				/** @type {Window} */ (
					target.querySelector('iframe')?.contentWindow
				).document.querySelector('h1')
			);

		assert.equal(h1().textContent, 'count: 0');
		assert.equal(getComputedStyle(h1()).color, 'rgb(255, 0, 0)');

		flushSync(() => button?.click());

		assert.equal(h1().textContent, 'count: 1');
		assert.equal(getComputedStyle(h1()).color, 'rgb(255, 0, 0)');
	}
});
