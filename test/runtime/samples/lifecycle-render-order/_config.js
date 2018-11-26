import order from './order.js';

export default {
	skip_if_ssr: true,

	test({ assert, component, target }) {
		assert.deepEqual(order, [
			'beforeUpdate',
			'render',
			'afterUpdate',
			'onMount'
		]);

		order.length = 0;
	}
};
