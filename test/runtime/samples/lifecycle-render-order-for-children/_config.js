import order from './order.js';

export default {
	skip_if_ssr: true,
	before_test() {
		order.length = 0;
	},
	test({ assert, component, target, compileOptions }) {
		if (compileOptions.hydratable) {
			assert.deepEqual(order, [
				'0: beforeUpdate',
				'0: render',
				'1: beforeUpdate',
				'1: render',
				'2: beforeUpdate',
				'2: render',
				'3: beforeUpdate',
				'3: render',
				'1: onMount',
				'1: afterUpdate',
				'2: onMount',
				'2: afterUpdate',
				'3: onMount',
				'3: afterUpdate',
				'0: onMount',
				'0: afterUpdate'
			]);
		} else {
			assert.deepEqual(order, [
				'0: beforeUpdate',
				'0: render',
				'1: beforeUpdate',
				'2: beforeUpdate',
				'3: beforeUpdate',
				'1: render',
				'2: render',
				'3: render',
				'1: onMount',
				'1: afterUpdate',
				'2: onMount',
				'2: afterUpdate',
				'3: onMount',
				'3: afterUpdate',
				'0: onMount',
				'0: afterUpdate'
			]);
		}
	}
};
