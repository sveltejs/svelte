export default {
	async test({ assert, component }) {
		assert.equal(component.object_updates, 1);
	},
};
