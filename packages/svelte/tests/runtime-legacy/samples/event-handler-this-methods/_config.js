import { ok, test } from '../../test';

export default test({
	test({ assert, target, window }) {
		// Click events don't focus elements in JSDOM – obviously they would
		// in real browsers. More realistically, you'd use this for e.g.
		// this.select(), but that's harder to test than this.focus()

		const wont = target.querySelector('.wont-focus');
		const will = target.querySelector('.will-focus');
		ok(wont);
		ok(will);

		wont.dispatchEvent(new window.MouseEvent('click', { bubbles: true }));
		assert.equal(window.document.activeElement, window.document.body);

		will.dispatchEvent(new window.MouseEvent('click', { bubbles: true }));
		assert.equal(window.document.activeElement, will);
	}
});
