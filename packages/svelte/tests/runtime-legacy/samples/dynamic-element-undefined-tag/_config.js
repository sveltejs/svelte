import { test } from '../../test';

export default test({
	html: '',
	test({ component, target, assert }) {
		component.tag = 'h1';
		assert.htmlEqual(target.innerHTML, '<h1>Foo</h1>');

		component.tag = null;
		assert.htmlEqual(target.innerHTML, '');

		component.tag = 'div';
		assert.htmlEqual(target.innerHTML, '<div>Foo</div>');

		component.tag = false;
		assert.htmlEqual(target.innerHTML, '');

		component.tag = 'span';
		assert.htmlEqual(target.innerHTML, '<span>Foo</span>');
	}
});
