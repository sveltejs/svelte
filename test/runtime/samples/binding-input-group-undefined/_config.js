export default {

	async test({ assert, target, component, window }) {
		const [input1, input2, input3] = target.querySelectorAll('input');
		const event = new window.Event('change');

		function validate_inputs(v1, v2, v3) {
			assert.equal(input1.checked, v1);
			assert.equal(input2.checked, v2);
			assert.equal(input3.checked, v3);
		}

		assert.deepEqual(component.values.inner, []);
		validate_inputs(false, false, false);

		component.values = { inner: undefined };
		assert.deepEqual(component.values.inner, undefined);
		validate_inputs(false, false, false);

		input1.checked = true;
		await input1.dispatchEvent(event);
		assert.deepEqual(component.values.inner, ['first']);
		validate_inputs(true, false, false);
	}
};
