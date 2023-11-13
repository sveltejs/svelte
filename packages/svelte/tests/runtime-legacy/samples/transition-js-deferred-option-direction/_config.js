import { test } from '../../test';

export default test({
	test({ assert, component, target }) {
		component.visible = true;

		const div_in = /** @type {HTMLDivElement & { directions: string }} */ (
			target.querySelector('#in')
		);
		const div_out = /** @type {HTMLDivElement & { directions: string }} */ (
			target.querySelector('#out')
		);
		const div_bothin = /** @type {HTMLDivElement & { directions: string }} */ (
			target.querySelector('#both-in')
		);
		const div_bothout = /** @type {HTMLDivElement & { directions: string }} */ (
			target.querySelector('#both-out')
		);

		assert.equal(div_in.directions, 'in,in');
		assert.equal(div_out.directions, 'out,out');
		assert.equal(div_bothin.directions, 'both,in');
		assert.equal(div_bothout.directions, 'both,out');
	}
});
