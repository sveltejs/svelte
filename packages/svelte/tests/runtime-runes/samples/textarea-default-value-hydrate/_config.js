import { test } from '../../test';

export default test({
	ssrHtml: `<form><textarea>hello</textarea> <input type="reset" value="Reset"></form>`,

	async test({ assert, target }) {
		const textarea = /** @type {HTMLTextAreaElement} */ (target.querySelector('textarea'));
		const reset = /** @type {HTMLInputElement} */ (target.querySelector('input[type=reset]'));

		assert.equal(textarea.value, 'hello');
		assert.equal(textarea.defaultValue, 'hello');

		textarea.value = 'changed';
		reset.click();
		await Promise.resolve();

		assert.equal(textarea.value, 'hello');
	}
});
