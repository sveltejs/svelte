export default {
	props: {
		tag: 'div'
	},
	html: '<div>Foo</div>',

	test({ assert, component, target }) {
		component.tag = 'h1';

		assert.htmlEqual(
			target.innerHTML,
			`
			<h1>Foo</h1>
		`
		);
	}
};
