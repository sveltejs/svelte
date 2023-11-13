import { test } from '../../test';
import { vi } from 'vitest';

/** @type {Window['scrollTo']} */
let original_scrollTo;

export default test({
	before_test() {
		vi.useFakeTimers();

		Object.defineProperties(window, {
			pageYOffset: {
				value: 0,
				configurable: true,
				writable: true
			},
			pageXOffset: {
				value: 0,
				configurable: true,
				writable: true
			}
		});
		original_scrollTo = window.scrollTo;

		// @ts-ignore
		window.scrollTo = (x, y) => {
			window.scrollX = x;
			window.pageYOffset = y;
		};
	},

	after_test() {
		vi.useRealTimers();
		window.scrollTo = original_scrollTo;
	},

	async test({ assert, component, window }) {
		assert.equal(window.pageYOffset, 0);

		// clear the previous 'scrolling' state
		await vi.runAllTimersAsync();
		component.scrollY = 100;

		await vi.runAllTimersAsync();
		assert.equal(window.pageYOffset, 100);
	}
});
