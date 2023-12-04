import { test } from '../../test';

export default test({
	get props() {
		return { raw: '<span>foo</span>' };
	},

	test({ assert, component, target, variant }) {
		const span = target.querySelector('span');
		if (variant === 'dom') {
			assert.equal(span?.previousSibling?.nodeName, 'BR');
		} else {
			// ssr comment inbetween
			assert.equal(span?.previousSibling?.nodeName, '#comment');
			assert.equal(span?.previousSibling?.previousSibling?.nodeName, 'BR');
		}

		component.raw = '<span>bar</span>';
	}
});
