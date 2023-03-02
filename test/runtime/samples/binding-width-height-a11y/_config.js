export default {
	async test({ assert, target }) {
		const iframe = target.querySelector('iframe');

		assert.equal(iframe.getAttribute('aria-hidden'), 'true');
		assert.equal(iframe.getAttribute('tabindex'), '-1');
	}
};
