import { test } from '../../test';

export default test({
	html: 'Foo',

	test({ assert, component }) {
		assert.ok(component.test);
	}
});
