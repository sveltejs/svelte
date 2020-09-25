export default {
	props: {
		tag: 'div',
		text: 'Foo'
	},
	html: '<div><div>Foo</div></div>',

	test({ assert, component, target }) {
		const innerDiv = target.querySelector('div > div');
		component.tag = 'h1';
		component.text = 'Bar';

		assert.htmlEqual(
			target.innerHTML,
			`
			<h1><div>Bar</div></h1>
		`
		);

		assert.equal(innerDiv, target.querySelector('h1 > div'));
	}
};
