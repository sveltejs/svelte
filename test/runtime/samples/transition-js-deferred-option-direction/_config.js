export default {
	test({ assert, component, target, raf }) {
		component.visible = true;

		const divIn = target.querySelector('#in');
		const divOut = target.querySelector('#out');
		const divBoth = target.querySelector('#both');

		assert.equal(divIn.initial, 'in');
		assert.equal(divOut.initial, 'out');
		assert.equal(divBoth.initial, 'both');

		return Promise.resolve().then(() => {
			assert.equal(divIn.later, 'in');
			assert.equal(divOut.later, 'out');
			assert.equal(divBoth.later, 'both');
		});
	}
};
