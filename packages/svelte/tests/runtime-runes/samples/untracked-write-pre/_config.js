import { test } from '../../test';

export default test({
	test({ assert, target, logs }) {
		assert.deepEqual(logs, ['Outer', 'Inner', 'Outer', 'Inner']);
	}
});
