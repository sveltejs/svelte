export default {
	async test({ assert, target, component, window }) {
		const button = target.querySelector('button');
		const clickEvent = new window.Event('click');
		const changeEvent = new window.Event('change');

		const [input1, input2] = target.querySelectorAll('input[type="checkbox"]');
		function validate_inputs(v1, v2) {
			assert.equal(input1.checked, v1);
			assert.equal(input2.checked, v2);
		}

		assert.deepEqual(component.test, []);
		validate_inputs(false, false);

		component.test = ['a', 'b'];
		validate_inputs(true, true);

		input1.checked = false;
		await input1.dispatchEvent(changeEvent);
		assert.deepEqual(component.test, ['b']);

		input2.checked = false;
		await input2.dispatchEvent(changeEvent);
		assert.deepEqual(component.test, []);

		input1.checked = true;
		input2.checked = true;
		await input1.dispatchEvent(changeEvent);
		await input2.dispatchEvent(changeEvent);
		assert.deepEqual(component.test, ['b', 'a']);

		await button.dispatchEvent(clickEvent);
		assert.deepEqual(component.test, ['b', 'a']); // should it be ['a'] only? valid arguments for both outcomes

		input1.checked = false;
		await input1.dispatchEvent(changeEvent);
		assert.deepEqual(component.test, []);
	}
};
