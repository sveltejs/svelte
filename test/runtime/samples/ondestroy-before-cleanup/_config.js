export default {
	test(assert, component, target) {
		const top = component.top;
		const div = target.querySelector('div');

		component.visible = false;
		assert.equal(top.refOnDestroy, div);
	}
};