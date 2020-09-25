export default {
	props: {
		tag: 'di',
		text: 'Foo'
	},
	html: '<div>Foo</div>',

	test({ assert, component, target }) {
		const div = target.firstChild;
		component.tag = 'na';
		component.text = 'Bar';

		assert.htmlEqual(target.innerHTML, `
			<nav>Bar</nav>
		`);

		const h1 = target.firstChild;
		assert.notEqual(div, h1);
	}
};
