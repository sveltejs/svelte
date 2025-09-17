import { test } from '../../test';
import { destroyed, reset } from './destroyed.js';

export default test({
	mode: ['async-server'],

	before_test() {
		reset();
	},

	test_ssr({ assert }) {
		assert.deepEqual(destroyed, ['C', 'A', 'B', 'B*', 'root']);
	}
});
