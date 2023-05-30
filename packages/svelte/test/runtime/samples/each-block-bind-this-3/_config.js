export default {
	html: `
    <p>10</p><p>20</p><p>30</p>
	`,

	async test({ assert, window, component, target }) {
		const pArray = target.querySelectorAll('p');
		assert.equal(component.bindings[10], pArray[0]);
		assert.equal(component.bindings[20], pArray[1]);
		assert.equal(component.bindings[30], pArray[2]);
	}
};
