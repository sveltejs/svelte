import order from './order.js';

export default {
	'skip-ssr': true,

	test(assert, component, target) {
		assert.deepEqual(order, [
			'onprops',
			'render',
			'oncreate',
			'onupdate'
		]);

		order.length = 0;
	}
};
