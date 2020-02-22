import order from './order.js';

export default {
	skip_if_ssr: true,

	before_test() {
		order.length = 0;
	},
	test({ assert }) {
		assert.deepEqual(order, [
			'beforeUpdate',
			'render',
			'onMount',
			'afterUpdate'
		]);
	}
};
