import { test } from '../../test';
import { destroyed, reset } from './destroyed.js';

export default test({
	before_test() {
		reset();
	},

	test({ assert, component }) {
		component.visible = false;
		assert.deepEqual(destroyed, ['C', 'B', 'A']);
	},

	test_ssr({ assert }) {
		assert.deepEqual(destroyed, ['C', 'B', 'A']);
	}
});
