export default {
	html: `
		<h1>tag is h1.</h1>
	`,

	async test({ assert, component, target }) {

		assert.equal(component.tag, 'h1');
		assert.equal(component.updateText, '');
		assert.equal(component.destroyText, '');

		component.tag = 'h2';

		assert.equal(component.tag, 'h2');
		assert.equal(component.updateText, 'update: h2');
		assert.equal(component.destroyText, 'destroy');
		assert.htmlEqual(target.innerHTML, `
			<h2>tag is h2.</h2>
		`);
	}
};
