import { test } from '../../test';

// binding member expression shouldn't invalidate the property name
export default test({
	test({ assert, component, target }) {
		const div = target.querySelector('div');
		assert.equal(div, component.container.a);
		assert.deepEqual(component.logs.length, 1);
	}
});
