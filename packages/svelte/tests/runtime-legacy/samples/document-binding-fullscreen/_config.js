import { test } from '../../test';

export default test({
	before_test() {
		Object.defineProperties(window.document, {
			fullscreenElement: {
				value: null,
				configurable: true
			}
		});
	},

	async test({ assert, target, window, component }) {
		const event = new window.Event('fullscreenchange');

		const div = target.querySelector('div');

		Object.defineProperties(window.document, {
			fullscreenElement: {
				value: div,
				configurable: true
			}
		});

		window.document.dispatchEvent(event);

		assert.equal(component.fullscreen, div);
	}
});
