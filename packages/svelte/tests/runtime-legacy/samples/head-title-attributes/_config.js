import { test } from '../../test';

export default test({
	test({ assert, component, window }) {
		assert.equal(window.document.title, 'Foo');

		const elems = window.document.getElementsByTagName('title');
		assert.equal(elems.length, 1);
		const attrValue = elems[0].getAttribute('aria-live');
		assert.equal(attrValue, 'assertive');
	}
});
