import { flushSync } from 'svelte';
import { test } from '../../assert';

export default test({
	async test({ target, assert }) {
		const button = target.querySelector('button');
		const h1 = () =>
			/** @type {NodeListOf<HTMLHeadingElement>} */ (
				/** @type {Window} */ (
					target.querySelector('iframe')?.contentWindow
				).document.querySelectorAll('h1')
			);

		assert.equal(h1()[0].textContent, 'count: 0');
		assert.equal(getComputedStyle(h1()[0]).color, 'rgb(255, 0, 0)');
		assert.equal(getComputedStyle(h1()[1]).color, 'rgb(0, 0, 255)');

		flushSync(() => button?.click());

		assert.equal(h1()[0].textContent, 'count: 1');
		assert.equal(getComputedStyle(h1()[0]).color, 'rgb(255, 0, 0)');
		assert.equal(getComputedStyle(h1()[1]).color, 'rgb(0, 0, 255)');
	}
});
