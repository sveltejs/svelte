export default {
	test({ assert, target }) {
		const div = target.querySelector('div');

		assert.equal('error', div.className);
	}
};