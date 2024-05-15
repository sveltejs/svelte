import { flushSync } from 'svelte';
import { test } from '../../test';

/** @type {Window['scrollTo']} */
let original_scrollTo;

export default test({
	before_test() {
		original_scrollTo = window.scrollTo;

		// @ts-ignore
		window.scrollTo = (x, y) => {
			window.scrollX = x;
			window.scrollY = y;
		};
	},

	after_test() {
		window.scrollTo = original_scrollTo;
	},

	async test({ assert, component, window, target }) {
		window.scrollTo(0, 500);

		const button = target.querySelector('button');
		flushSync(() => button?.click());

		assert.equal(window.scrollY, 500);
	}
});
