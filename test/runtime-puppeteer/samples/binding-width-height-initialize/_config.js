export default {
	async test({ assert, component }) {
		assert.equal(component.toggle, true);
		assert.equal(component.offsetHeight, 800);
	}
};
