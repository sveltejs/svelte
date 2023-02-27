export default {
	test({ assert, component, target }) {
		component.visible = true;

		const div_in = target.querySelector('#in');
		const div_out = target.querySelector('#out');
		const div_both = target.querySelector('#both');

		assert.equal(div_in.direction, 'in');
		assert.equal(div_out.direction, 'out');
		assert.equal(div_both.direction, 'both');
	}
};
