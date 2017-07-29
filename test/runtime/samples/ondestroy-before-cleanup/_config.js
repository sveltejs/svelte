export default {
	test(assert, component, target) {
		const top = component.refs.top;
		const div = target.querySelector('div');

		component.set({ visible: false });
		assert.equal(top.refOnDestroy, div);
	}
};