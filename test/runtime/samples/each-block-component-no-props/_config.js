export default {
	html: `
		<p>hello</p>
	`,

	async test({ assert, component, target }) {
		await component.remove();
		assert.htmlEqual(target.innerHTML, ``);
	}
};
