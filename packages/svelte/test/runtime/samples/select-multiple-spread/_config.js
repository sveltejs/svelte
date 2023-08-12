export default {
	test({ assert, component, target }) {
		const options = target.querySelectorAll('option');

		assert.equal(options[0].selected, true);
		assert.equal(options[1].selected, false);

		// Shouldn't change the value because the value is not bound.
		component.value = ['2'];
		assert.equal(options[0].selected, true);
		assert.equal(options[1].selected, false);
	}
};
