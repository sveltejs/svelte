import { test } from '../../test';

export default test({
	html: '<div><p></p></div>',

	test({ assert, component, target }) {
		const { widget } = component;

		assert.equal(widget.show, false);

		widget.show = true;
		assert.htmlEqual(target.innerHTML, '<div><p>Hello</p></div>');

		component.data = 'World';
		assert.htmlEqual(target.innerHTML, '<div><p>World</p></div>');

		widget.show = false;
		assert.htmlEqual(target.innerHTML, '<div><p></p></div>');

		component.data = 'Goodbye';
		assert.htmlEqual(target.innerHTML, '<div><p></p></div>');

		widget.show = true;
		assert.htmlEqual(target.innerHTML, '<div><p>Goodbye</p></div>');
	}
});
