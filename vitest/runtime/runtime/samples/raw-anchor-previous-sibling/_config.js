export default {
	get props() {
		return { raw: '<span>foo</span>' };
	},

	test({ assert, component, target }) {
		const span = target.querySelector('span');
		assert.equal(span.previousSibling.nodeName, 'BR');

		component.raw = '<span>bar</span>';
	}
};
