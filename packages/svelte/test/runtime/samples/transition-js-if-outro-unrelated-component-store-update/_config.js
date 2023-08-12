export default {
	async test({ assert, target, component, raf }) {
		await component.condition.set(false);
		raf.tick(500);
		assert.htmlEqual(target.innerHTML, '');
	}
};
