import order from './order.js';

export default {
	skip_if_ssr: true,

	test({ assert, component, target }) {
		assert.deepEqual(order, [
			'0: beforeUpdate',
			'0: render',
			'1: beforeUpdate',
			'1: render',
			'2: beforeUpdate',
			'2: render',
			'3: beforeUpdate',
			'3: render',
			'1: afterUpdate',
			'1: onMount',
			'2: afterUpdate',
			'2: onMount',
			'3: afterUpdate',
			'3: onMount',
			'0: afterUpdate',
			'0: onMount',
		]);

		order.length = 0;
	}
};
