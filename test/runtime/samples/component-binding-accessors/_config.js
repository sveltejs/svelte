export default {
	async test({ assert, component, target, window }) {
		const [input1, input2] = target.querySelectorAll('input');
		assert.equal(input1.value, 'something');
		assert.equal(input2.value, 'something');

		input1.value = 'abc';

		await input1.dispatchEvent(new window.Event('input'));
		assert.equal(input1.value, 'abc');
		assert.equal(input2.value, 'abc');

		await target.querySelector('button').dispatchEvent(new window.MouseEvent('click'));

		assert.equal(input1.value, 'Reset');
		assert.equal(input2.value, 'Reset');
	}
};
