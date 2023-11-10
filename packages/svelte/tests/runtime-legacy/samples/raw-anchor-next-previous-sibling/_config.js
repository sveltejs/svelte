import { test } from '../../test';

export default test({
	get props() {
		return { raw: '<span>foo</span>' };
	},

	test({ assert, component, target, variant }) {
		const span = target.querySelector('span');
		if (variant === 'dom') {
			assert.equal(span?.previousSibling?.nodeName, 'BR');
			// next.next because of comment anchor before which @html is inserted
			assert.equal(span?.nextSibling?.nextSibling?.nodeName, 'BR');
		} else {
			// ssr comments inbetween
			assert.equal(span?.previousSibling?.nodeName, '#comment');
			assert.equal(span?.previousSibling?.previousSibling?.nodeName, 'BR');
			assert.equal(span?.nextSibling?.nodeName, '#comment');
			assert.equal(span?.nextSibling?.nextSibling?.nodeName, 'BR');
		}

		component.raw = '<span>bar</span>';
	}
});
