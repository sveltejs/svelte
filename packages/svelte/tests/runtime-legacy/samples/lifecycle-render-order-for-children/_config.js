import { test } from '../../test';
import order from './order.js';

let n = 0;

export default test({
	get props() {
		return {
			n
		};
	},
	before_test() {
		order.length = 0;
		n = 0;
	},
	test({ assert, compileOptions, component }) {
		assert.deepEqual(order, [
			'parent: beforeUpdate 0',
			'parent: render 0',
			'1: beforeUpdate 0',
			'1: render 0',
			'2: beforeUpdate 0',
			'2: render 0',
			'3: beforeUpdate 0',
			'3: render 0',
			'1: onMount 0',
			'1: afterUpdate 0',
			'2: onMount 0',
			'2: afterUpdate 0',
			'3: onMount 0',
			'3: afterUpdate 0',
			'parent: onMount 0',
			'parent: afterUpdate 0'
		]);

		order.length = 0;

		component.n += 1;

		assert.deepEqual(order, [
			'parent: beforeUpdate 1',
			'parent: render 1',
			'1: beforeUpdate 1',
			'1: render 1',
			'2: beforeUpdate 1',
			'2: render 1',
			'3: beforeUpdate 1',
			'3: render 1',
			'parent: afterUpdate 1',
			'1: afterUpdate 1',
			'2: afterUpdate 1',
			'3: afterUpdate 1'
		]);
	}
});
