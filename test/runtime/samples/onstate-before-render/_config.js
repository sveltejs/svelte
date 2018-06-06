import order from './order.js';

export default {
	'skip-ssr': true,

	test(assert, component, target) {
		assert.deepEqual(order, [
			'onstate',
			'render',
			'oncreate',
			'onupdate'
		]);
	}
};
