import { test } from '../../test';

export default test({
	test({ assert, component }) {
		assert.deepEqual(component.foo, {});
		component.bar = 'hello';
		assert.deepEqual(component.foo, { hello: true });
		component.bar = 'world';
		assert.deepEqual(component.foo, { hello: true, world: true });
		component.bar = false;
		assert.deepEqual(component.foo, { hello: true, world: true });
	}
});
