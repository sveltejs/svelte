import order from './order.js';

export default {
	skip_if_ssr: true,

	test({ assert }) {
		assert.deepEqual(order, [
			'beforeUpdate',
			'render',
			'onMount',
			'afterUpdate'
		]);

		order.length = 0;
	}
};
