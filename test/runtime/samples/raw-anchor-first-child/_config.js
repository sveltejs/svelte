export default {
	data: {
		raw: `<span>foo</span>`
	},

	test ( assert, component, target ) {
		const span = target.querySelector('span');
		assert.equal(!span.previousSibling);
	}
};
