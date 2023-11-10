import { test } from '../../test';

export default test({
	get props() {
		return { foo: 42 };
	},

	html: '<textarea></textarea>',
	ssrHtml: '<textarea>42</textarea>',

	test({ assert, component, target }) {
		const textarea = /** @type {HTMLTextAreaElement} */ (target.querySelector('textarea'));
		assert.strictEqual(textarea.value, '42');

		component.foo = 43;
		assert.strictEqual(textarea.value, '43');
	}
});
