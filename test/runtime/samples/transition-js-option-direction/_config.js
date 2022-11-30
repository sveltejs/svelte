export default {
	test({ assert, component, target }) {
		component.visible = true;

		const divIn = target.querySelector('#in');
		const divOut = target.querySelector('#out');
		const divBoth = target.querySelector('#both');

		assert.equal(divIn.direction, 'in');
		assert.equal(divOut.direction, 'out');
		assert.equal(divBoth.direction, 'both');
	}
};
