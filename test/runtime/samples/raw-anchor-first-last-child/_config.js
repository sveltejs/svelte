export default {
	props: {
		raw: '<span>foo</span>'
	},

	snapshot(target) {
		const span = target.querySelector('span');

		return {
			span
		};
	},

	test({ assert, component, target, snapshot }) {
		const span = target.querySelector('span');
		assert.ok(!span.previousSibling);
		assert.ok(!span.nextSibling);

		if (snapshot) {
			assert.equal(span, snapshot.span);
		}

		component.raw = '<span>bar</span>';
		assert.htmlEqual(target.innerHTML, '<div><span>bar</span></div>');
	}
};
