import { test } from '../../test';

export default test({
	test({ assert, component }) {
		assert.equal(component.qux, 2);

		component.foo = 2;
		assert.equal(component.qux, 4);
	}
});
