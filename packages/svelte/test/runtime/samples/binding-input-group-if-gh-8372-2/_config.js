export default {
	async test({ assert, target, component, window }) {
		const button = target.querySelector('button');
		const clickEvent = new window.Event('click');
		const changeEvent = new window.Event('change');

		const [input1, input2] = target.querySelectorAll('input[type="radio"]');
		function validate_inputs(v1, v2) {
			assert.equal(input1.checked, v1);
			assert.equal(input2.checked, v2);
		}

		component.test = 'a';
		validate_inputs(true, false);

		component.test = 'b';
		validate_inputs(false, true);

		input1.checked = true;
		await input1.dispatchEvent(changeEvent);
		assert.deepEqual(component.test, 'a');

		input2.checked = true;
		await input2.dispatchEvent(changeEvent);
		assert.deepEqual(component.test, 'b');

		await button.dispatchEvent(clickEvent);
		assert.deepEqual(component.test, 'b'); // should it be undefined? valid arguments for both outcomes

		input1.checked = true;
		await input1.dispatchEvent(changeEvent);
		assert.deepEqual(component.test, 'a');
	}
};
