import { assert_ok, test } from '../../assert';

// A browser test because JSDOM doesn't support contenteditable
export default test({
	html: '<div contenteditable="false"></div>',

	async test({ assert, target, component, window }) {
		const div = target.querySelector('div');
		assert_ok(div);
		const text = window.document.createTextNode('a');
		div.insertBefore(text, null);
		assert.equal(div.textContent, 'a');
		component.text = 'bcde';
		assert.equal(div.textContent, 'bcdea');
	}
});
