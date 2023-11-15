import { test } from '../../test';

export default test({
	html: 'b baz',
	test({ assert, component, target }) {
		component.foo = true;
		assert.htmlEqual(target.innerHTML, 'a baz');
	}
});
