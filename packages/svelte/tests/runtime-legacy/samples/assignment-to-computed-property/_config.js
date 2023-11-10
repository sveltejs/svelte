import { test } from '../../test';

export default test({
	test({ assert, component }) {
		assert.deepEqual(component.foo, { baz: 1 });
	}
});
