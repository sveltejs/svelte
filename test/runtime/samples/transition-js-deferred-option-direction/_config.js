export default {
	test({ assert, component, target }) {
		component.visible = true;

		const div_in = target.querySelector('#in');
		const div_out = target.querySelector('#out');
		const div_both = target.querySelector('#both');

		assert.equal(div_in.initial, 'in');
		assert.equal(div_out.initial, 'out');
		assert.equal(div_both.initial, 'both');

		return Promise.resolve().then(() => {
			assert.equal(div_in.later, 'in');
			assert.equal(div_out.later, 'out');
			assert.equal(div_both.later, 'both');
		});
	}
};
