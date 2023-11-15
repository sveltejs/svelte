import { test } from '../../test';

export default test({
	get props() {
		return { tag: 'div', text: 'Foo' };
	},
	html: '<div>Foo</div>',

	test({ assert, component, target }) {
		const div = target.querySelector('div');
		component.tag = 'nav';
		component.text = 'Bar';

		assert.htmlEqual(
			target.innerHTML,
			`
			<nav>Bar</nav>
		`
		);

		const nav = target.querySelector('nav');
		assert.notEqual(div, nav);
	}
});
