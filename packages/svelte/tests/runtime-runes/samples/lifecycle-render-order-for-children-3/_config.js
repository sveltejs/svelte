import { test } from '../../test';

/**
 * @type {any[]}
 */
let order = [];
let n = 0;

export default test({
	get props() {
		return {
			order,
			n
		};
	},
	before_test() {
		order.length = 0;
		n = 0;
	},
	async test({ assert, compileOptions, component }) {
		assert.deepEqual(order, [
			'parent: render 0',
			'1: $effect.pre 0',
			'1: render 0',
			'2: $effect.pre 0',
			'2: render 0',
			'3: $effect.pre 0',
			'3: render 0',
			'1: $effect 0',
			'2: $effect 0',
			'3: $effect 0',
			'parent: $effect 0'
		]);

		order.length = 0;

		component.n += 1;

		assert.deepEqual(order, [
			'parent: render 1',
			'1: $effect.pre 1',
			'1: render 1',
			'2: $effect.pre 1',
			'2: render 1',
			'3: $effect.pre 1',
			'3: render 1',
			'1: $effect 1',
			'2: $effect 1',
			'3: $effect 1',
			'parent: $effect 1'
		]);
	}
});
