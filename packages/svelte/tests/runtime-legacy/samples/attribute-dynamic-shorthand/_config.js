import { test } from '../../test';

export default test({
	props: {
		id: 'foo'
	},
	html: '<div id="foo"></div>',

	test({ assert, component, target }) {
		component.id = 'bar';
		assert.htmlEqual(target.innerHTML, '<div id="bar"></div>');
	}
});
