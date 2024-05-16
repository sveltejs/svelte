import { test } from '../../test';
import { vi } from 'vitest';

/** @type {Window['scrollTo']} */
let original_scrollTo;

export default test({
	before_test() {
		vi.useFakeTimers();

		Object.defineProperties(window, {
			scrollY: {
				value: 0,
				configurable: true,
				writable: true
			}
		});
	},

	after_test() {
		vi.useRealTimers();
	},

	async test({ assert, component, window }) {
		assert.equal(window.pageYOffset, 0);

		assert.equal(component.scrollY, 0);
	}
});
