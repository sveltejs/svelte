export default {
	test({ assert, component, target }) {
		const [input1, input2] = target.querySelectorAll('input');
		assert.equal(input1.value, 'value1');
		assert.equal(input2.value, 'value2');

		component.items = component.items.reverse();
		assert.equal(input1.value, 'value1');
		assert.equal(input2.value, 'value2');
	}
};
