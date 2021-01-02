export default {
	async test({ assert, target }) {
		const iframe = target.querySelector('iframe');

		assert.equal(iframe.style.zIndex, '-1');
	}
};
