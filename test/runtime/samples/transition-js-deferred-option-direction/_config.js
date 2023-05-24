export default {
	skip: true, // There's a nullpointer triggered by the test which wasn't caught by mocha for some reason. TODO reenable for Svelte 5
	test({ assert, component, target }) {
		component.visible = true;

		const div_in = target.querySelector('#in');
		const div_out = target.querySelector('#out');
		const div_bothin = target.querySelector('#both-in');
		const div_bothout = target.querySelector('#both-out');

		assert.equal(div_in.directions, 'in,in');
		assert.equal(div_out.directions, 'out');
		assert.equal(div_bothin.directions, 'both');
		assert.equal(div_bothout.directions, 'both');

		return Promise.resolve().then(() => {
			assert.equal(div_in.directions, 'in,in');
			assert.equal(div_out.directions, 'out,out');
			assert.equal(div_bothin.directions, 'both,in');
			assert.equal(div_bothout.directions, 'both,out');
		});
	}
};
