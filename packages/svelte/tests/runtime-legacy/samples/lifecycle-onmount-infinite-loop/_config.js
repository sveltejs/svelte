import { test } from '../../test';

export default test({
	test({ assert, component }) {
		const { count } = component;
		assert.deepEqual(count, 1);
	}
});
