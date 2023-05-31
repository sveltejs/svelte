export default {
	html: `
		<p>0</p><p>1</p><p>2</p>
	`,

	async test({ assert, component, target }) {
		const pArray = target.querySelectorAll('p');
		assert.equal(component.bindings[0], pArray[0]);
		assert.equal(component.bindings[1], pArray[1]);
		assert.equal(component.bindings[2], pArray[2]);
	}
};
