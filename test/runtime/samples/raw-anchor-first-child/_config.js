export default {
	data: {
		raw: `<span>foo</span>`
	},

	test ( assert, component, target ) {
		const span = target.querySelector('span');
		assert.ok(!span.previousSibling);

		component.set({
			raw: `<span>bar</span>`
		});
	}
};
