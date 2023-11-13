import { test } from '../../test';

export default test({
	async test({ assert, target, window }) {
		const [input1, input2] = /** @type {NodeListOf<HTMLInputElement>} */ (
			target.querySelectorAll('input[type=text]')
		);
		const radio = /** @type {HTMLInputElement} */ (target.querySelector('input[type=radio]'));

		assert.equal(radio.checked, false);

		const event = new window.Event('input');

		input1.value = 'world';
		await input1.dispatchEvent(event);
		await Promise.resolve();
		assert.equal(radio.checked, true);

		input2.value = 'foo';
		await input2.dispatchEvent(event);
		await Promise.resolve();
		assert.equal(radio.checked, false);

		input1.value = 'foo';
		await input1.dispatchEvent(event);
		assert.equal(radio.checked, true);

		input1.value = 'bar';
		await input1.dispatchEvent(event);
		assert.equal(radio.checked, false);

		input2.value = 'bar';
		await input2.dispatchEvent(event);
		await Promise.resolve();
		assert.equal(radio.checked, true);
	}
});
