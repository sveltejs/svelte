export default {
	async test({ assert, target }) {
		await new Promise(f => setTimeout(f, 0));
		assert.htmlEqual(target.innerHTML, 'This component has been mounted 1 times.');
	}
};
