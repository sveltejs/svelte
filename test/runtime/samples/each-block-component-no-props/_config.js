export default {
	html: `
		<p>hello</p>
	`,

	async test({ assert, component, target }) {
		await component.remove();
		assert.htmlEqual(target.innerHTML, '');

		await component.add();
		assert.htmlEqual(target.innerHTML, '<p>hello</p>');

		await component.remove();
		assert.htmlEqual(target.innerHTML, '');
	}
};
