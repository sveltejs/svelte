export default {
	test({ assert, component, target }) {
		const options = target.querySelectorAll('option');

		assert.equal(options[0].selected, true);
		assert.equal(options[1].selected, false);

		component.value = ['2'];
		assert.equal(options[0].selected, false);
		assert.equal(options[1].selected, true);
	}
};
