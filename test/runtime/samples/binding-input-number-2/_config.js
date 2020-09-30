export default {
	test({ assert, target, window, component }) {
		const input = target.querySelector('input');
		const inputEvent = new window.InputEvent('input');
		assert.equal(component.value, 5);
		assert.equal(input.value, '5');

		input.value = '5.';
		input.dispatchEvent(inputEvent);

		// input type number has value === "" if ends with dot/comma
		assert.equal(component.value, undefined);
		assert.equal(input.value, '');

		input.value = '5.5';
		input.dispatchEvent(inputEvent);

		assert.equal(component.value, 5.5);
		assert.equal(input.value, '5.5');

		input.value = '5.50';
		input.dispatchEvent(inputEvent);

		assert.equal(component.value, 5.5);
		assert.equal(input.value, '5.50');

		component.value = 1;
		assert.equal(component.value, 1);
		assert.equal(input.value, '1');
	}
};
