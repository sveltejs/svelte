import { test } from '../../test';
import { destroyed, reset } from './destroyed.js';

export default test({
	before_test() {
		reset();
	},

	test({ assert, component }) {
		component.visible = false;
		assert.deepEqual(destroyed, ['A', 'B', 'C']);
	},

	test_ssr({ assert }) {
		assert.deepEqual(destroyed, ['A', 'B', 'C']);
	}
});
