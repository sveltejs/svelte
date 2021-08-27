export default {
	async test({ assert, component, target, window }) {
		const select = target.querySelector('select');

		assert.equal(select.value, '1');

		component.label = 'hoge';

		assert.equal(select.value, '1');
	}
};
