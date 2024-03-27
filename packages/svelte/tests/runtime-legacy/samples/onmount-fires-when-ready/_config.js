import { test } from '../../test';

export default test({
	mode: ['client', 'hydrate'], // uses oncreate

	html: '<div><p>true</p></div>',

	test({ assert, component, target }) {
		component.foo = true;
		assert.htmlEqual(target.innerHTML, '<div><p>true</p>\n<p>true</p></div>');
	}
});
