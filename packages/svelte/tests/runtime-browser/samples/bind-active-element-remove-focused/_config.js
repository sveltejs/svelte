import { test, ok } from '../../assert';

export default test({
	mode: ['client'],
	async test({ assert, target }) {
		/** @type {string[]} */
		const errors = [];
		/** @param {ErrorEvent} event */
		const on_error = (event) => {
			errors.push(event.message);
			event.preventDefault();
		};
		window.addEventListener('error', on_error);

		const button = target.querySelector('button');
		ok(button);

		button.focus();
		button.click();
		await new Promise((r) => setTimeout(r, 0));

		window.removeEventListener('error', on_error);

		assert.equal(errors.length, 0, errors.join('\n'));
		assert.equal(target.querySelector('button'), null);
	}
});
