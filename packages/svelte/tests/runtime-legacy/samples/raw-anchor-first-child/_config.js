import { ok, test } from '../../test';

export default test({
	get props() {
		return { raw: '<span>foo</span>' };
	},

	test({ assert, component, target, variant }) {
		const span = target.querySelector('span');
		ok(span);
		if (variant === 'dom') {
			assert.ok(!span.previousSibling);
		} else {
			assert.equal(span.previousSibling?.textContent, '1tbe2lq'); // hash of the value
		}

		component.raw = '<span>bar</span>';
		assert.htmlEqual(target.innerHTML, '<div><span>bar</span></div>');
	}
});
