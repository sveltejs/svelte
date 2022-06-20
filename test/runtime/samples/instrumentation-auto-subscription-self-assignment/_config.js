export default {
	html: '[]',

	async test({ assert, component, target }) {
		await component.go();
		assert.htmlEqual(target.innerHTML, '[42]');
	}
};
