import { vi } from 'vitest';

export default {
	before_test() {
		vi.useFakeTimers();

		Object.defineProperties(window, {
			pageYOffset: {
				value: 0,
				configurable: true
			},
			pageXOffset: {
				value: 0,
				configurable: true
			}
		});
	},

	after_test() {
		vi.useRealTimers();
	},

	async test({ assert, component, window }) {
		assert.equal(window.pageYOffset, 0);

		// clear the previous 'scrolling' state
		vi.runAllTimers();
		component.scrollY = 100;

		vi.runAllTimers();
		assert.equal(window.pageYOffset, 100);
	}
};
