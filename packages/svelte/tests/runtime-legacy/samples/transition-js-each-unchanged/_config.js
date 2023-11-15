import { test } from '../../test';

export default test({
	get props() {
		return { numbers: [1, 2, 3, 4, 5] };
	},

	test({ assert, component, target }) {
		const divs1 = /** @type {NodeListOf<HTMLDivElement & { foo: number }>} */ (
			target.querySelectorAll('div')
		);
		assert.equal(divs1[0].foo, undefined);

		component.numbers = [1, 2, 5, 4, 3];
		const divs2 = target.querySelectorAll('div');

		assert.equal(divs1[0], divs2[0]);
		assert.equal(divs1[1], divs2[1]);
		assert.equal(divs1[2], divs2[2]);
		assert.equal(divs1[3], divs2[3]);
		assert.equal(divs1[4], divs2[4]);

		assert.equal(divs1[0].foo, undefined);
		assert.equal(divs1[1].foo, undefined);
		assert.equal(divs1[2].foo, undefined);
		assert.equal(divs1[3].foo, undefined);
		assert.equal(divs1[4].foo, undefined);
	}
});
