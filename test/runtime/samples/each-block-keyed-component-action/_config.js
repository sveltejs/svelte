export default {
	test({ assert, component, raf }) {
		assert.equal(component.count, 0);

		component.arr = ['2'];

		assert.equal(component.count, 1);

		component.arr = ['1', '2'];

		assert.equal(component.count, 2);

		component.arr = ['2', '1'];

		assert.equal(component.count, 2);

		component.arr = [];

		assert.equal(component.count, 0);
	}
};
