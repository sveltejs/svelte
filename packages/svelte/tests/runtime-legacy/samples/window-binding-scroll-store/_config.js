import { test } from '../../test';

/** @type {Window['scrollTo']} */
let original_scrollTo;

export default test({
	before_test() {
		Object.defineProperties(window, {
			scrollY: {
				value: 0,
				configurable: true
			}
		});
		original_scrollTo = window.scrollTo;

		// @ts-ignore
		window.scrollTo = (x, y) => {};
	},

	after_test() {
		window.scrollTo = original_scrollTo;
	},

	async test({ assert, target, window }) {
		assert.equal(window.scrollY, 0);

		const event = new window.Event('scroll');
		Object.defineProperties(window, {
			scrollY: {
				value: 234,
				configurable: true
			}
		});

		await window.dispatchEvent(event);

		assert.htmlEqual(
			target.innerHTML,
			'<p style="position: fixed; top: 1em; left: 1em;">scroll\ny\nis\n234.\n234\n*\n234\n=\n54756</p><div style="height: 9999px"></div>'
		);
	}
});
