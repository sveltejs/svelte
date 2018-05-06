export default {
	data: {
		props: {
			a: 1,
		},
	},

	html: ``,

	test(assert, component, target) {
		component.set({
			props: {
				a: 2,
			},
		});

		assert.htmlEqual(target.innerHTML, ``);
	},
};
