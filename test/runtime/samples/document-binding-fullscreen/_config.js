export default {
	before_test() {
		Object.defineProperties(window.document, {
			fullscreenElement: {
				value: null,
				configurable: true
			}
		});
	},

	// copied from window-binding
	// there's some kind of weird bug with this test... it compiles with the wrong require.extensions hook for some bizarre reason
	skip_if_ssr: true,

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
};
