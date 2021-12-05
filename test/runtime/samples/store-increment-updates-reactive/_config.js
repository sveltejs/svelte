export default {
	html: '0',

	async test({ assert, component, target }) {
		await component.increment();
		assert.htmlEqual(target.innerHTML, '1');
	}
};
