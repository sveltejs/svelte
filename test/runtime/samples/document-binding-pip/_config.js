export default {
	before_test() {
		Object.defineProperties(document, {
			pictureInPictureElement: {
				value: null,
				configurable: true
			}
		});
	},

  // copied from window-binding
  // there's some kind of weird bug with this test... it compiles with the wrong require.extensions hook for some bizarre reason
	skip_if_ssr: true, 

	async test({ assert, target, window, component }) {
		const enter = new window.Event('enterpictureinpicture');

    const div = target.querySelector('div');

		Object.defineProperties(window.document, {
			pictureInPictureElement: {
				value: div,
				configurable: true
			}
		});

		window.document.dispatchEvent(enter);

		assert.equal(component.pip, div);

		const leave = new window.Event('leavepictureinpicture');
    
		Object.defineProperties(window.document, {
			pictureInPictureElement: {
				value: null,
				configurable: true
			}
		});
    
		window.document.dispatchEvent(leave);

		assert.equal(component.pip, null);
	}
};
