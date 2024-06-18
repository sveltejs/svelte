import { test } from '../../test';

export default test({
	skip_mode: ['client'],

	async test({ assert, target, hydrate }) {
		// @ts-ignore
		window.is_browser = true;
		hydrate();
		assert.htmlEqual(target.innerHTML, '<input type="text">');
		const input = /** @type {HTMLInputElement} */ (target.querySelector('input'));
		assert.htmlEqual(input.value, 'browser');
	}
});
