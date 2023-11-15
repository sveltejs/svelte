import { test } from '../../test';
import order from './order.js';

export default test({
	before_test() {
		order.length = 0;
	},
	test({ assert }) {
		assert.deepEqual(order, ['beforeUpdate', 'render', 'onMount', 'afterUpdate']);
	}
});
