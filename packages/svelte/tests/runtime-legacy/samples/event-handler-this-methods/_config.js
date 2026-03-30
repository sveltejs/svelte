import { ok, test } from '../../test';

export default test({
	test({ assert, target, window }) {
		// Click events don't focus elements in JSDOM – obviously they would
		// in real browsers. More realistically, you'd use this for e.g.
		// this.select(), but that's harder to test than this.focus()

		const won't = target.querySelector('.won't-focus');
		const will = target.querySelector('.will-focus');
		ok(won't);
		ok(will);

		won't.dispatchEvent(new window.MouseEvent('click', { bubbles: true }));
		assert.equal(window.document.activeElement, window.document.body);

		will.dispatchEvent(new window.MouseEvent('click', { bubbles: true }));
		assert.equal(window.document.activeElement, will);
	}
});
