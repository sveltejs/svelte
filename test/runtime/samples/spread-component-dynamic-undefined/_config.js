export default {
	props: {
		props: {
			a: 1,
		},
	},

	html: ``,

	test({ assert, component, target }) {
		component.props = {
			a: 2,
		};

		assert.htmlEqual(target.innerHTML, ``);
	},
};
