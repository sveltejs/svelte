export default {
	async test({ assert, target }) {
		const object = target.querySelector('object');

		assert.equal(object.getAttribute('aria-hidden'), "true");
		assert.equal(object.getAttribute('tabindex'), "-1");
	}
};
