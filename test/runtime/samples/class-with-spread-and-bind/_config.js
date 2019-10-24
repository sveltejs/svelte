export default {
	props: {
		primary: true,
	},

	html: `<div class="test-class primary" role="button"></div>`,

	test({ assert, component, target, window }) {
		component.primary = true;

		assert.htmlEqual(
			target.innerHTML,
			`
			<div class="test-class primary" role="button"></div>
		`
		);
	},
};
