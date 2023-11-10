import { test } from '../../test';

export default test({
	test({ assert, component, target }) {
		component.visible = true;

		const div_in = /** @type {HTMLDivElement & { direction: string }} */ (
			target.querySelector('#in')
		);
		const div_out = /** @type {HTMLDivElement & { direction: string }} */ (
			target.querySelector('#out')
		);
		const div_both = /** @type {HTMLDivElement & { direction: string }} */ (
			target.querySelector('#both')
		);

		assert.equal(div_in.direction, 'in');
		assert.equal(div_out.direction, 'out');
		assert.equal(div_both.direction, 'both');
	}
});
