import order from './order.js';

export default {
	'skip-ssr': true,

	test(assert, component, target) {
		assert.deepEqual(order, [
			'beforeRender',
			'render',
			'oncreate',
			'afterRender'
		]);

		order.length = 0;
	}
};
