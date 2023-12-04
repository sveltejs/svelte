import { test, ok } from '../../test';

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
			// hydration: previous is the ssr comment
			assert.ok(!span.previousSibling?.previousSibling);
		}
		// next is the anchor
		assert.ok(!span.nextSibling?.nextSibling);

		component.raw = '<span>bar</span>';
	}
});
