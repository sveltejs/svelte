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

		const sibling = target.querySelector('input');
		ok(sibling);

		sibling.focus();
		sibling.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
		await new Promise((resolve) => setTimeout(resolve, 0));

		const nested = target.querySelector('input');
		ok(nested);

		nested.focus();
		nested.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
		await new Promise((resolve) => setTimeout(resolve, 0));

		window.removeEventListener('error', on_error);

		assert.equal(errors.length, 0, errors.join('\n'));
		assert.htmlEqual(target.innerHTML, '<p>blurs: 1</p><p>nested blurs: 1</p>');
	}
});
