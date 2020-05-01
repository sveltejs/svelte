export default {
	html: `<input>`,

	test({ assert, component, target, window }) {
		const input = target.querySelector('input');
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
	},
};
