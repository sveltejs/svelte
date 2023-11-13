import { ok, test } from '../../test';

export default test({
	html: '<input>',

	test({ assert, target, window }) {
		const input = target.querySelector('input');
		ok(input);

		const event = new window.KeyboardEvent('keydown', {
			key: 'Enter'
		});

		let blurred = false;

		input.focus();

		input.addEventListener('blur', () => {
			blurred = true;
		});

		input.dispatchEvent(event);

		assert.ok(blurred);
	}
});
