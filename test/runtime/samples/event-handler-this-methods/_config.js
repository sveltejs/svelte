export default {
	test({ assert, component, target, window }) {
		// Click events don't focus elements in JSDOM – obviously they would
		// in real browsers. More realistically, you'd use this for e.g.
		// this.select(), but that's harder to test than this.focus()

		const wont = target.querySelector('.wont-focus');
		const will = target.querySelector('.will-focus');

		wont.dispatchEvent(new window.MouseEvent('click'));
		assert.equal(window.document.activeElement, window.document.body);

		will.dispatchEvent(new window.MouseEvent('click'));
		assert.equal(window.document.activeElement, will);
	}
};
