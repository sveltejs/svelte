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
			assert.ok(span.previousSibling?.textContent === ''); // ssr commment node
		}

		component.raw = '<span>bar</span>';
		assert.htmlEqual(target.innerHTML, '<div><span>bar</span></div>');
	}
});
