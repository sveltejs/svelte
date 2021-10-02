export default {
	async test({ assert, component, target }) {
		const select = target.querySelector('select');

		assert.equal(select.value, '1');

		component.label = 'hoge';

		assert.equal(select.value, '1');
	}
};
