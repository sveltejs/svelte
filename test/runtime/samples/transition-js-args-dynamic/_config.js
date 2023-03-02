export default {
	test({ assert, component, target, raf }) {
		component.visible = true;

		const div = target.querySelector('div');

		assert.equal(div.value, 0);

		raf.tick(200);

		div.value = 'test';
		component.visible = false;
		assert.equal(div.value, 'test');
	}
};
