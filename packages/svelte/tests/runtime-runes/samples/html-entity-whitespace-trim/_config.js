import { test } from '../../test';

export default test({
	test({ assert, target }) {
		const [trimmed, collapsed] = target.querySelectorAll('p');
		const [raw_text, markup] = target.querySelectorAll('style');

		// whitespace written as a character reference is trimmed and collapsed like any other
		// whitespace, in the client template as in the server-rendered HTML
		assert.equal(trimmed.querySelector('span')?.textContent, 'Hello,');
		assert.equal(collapsed.textContent, 'x y z');

		// the text of a `<style>` is not decoded, so it is kept as written...
		assert.equal(raw_text.textContent, '&#32;b{}&#32;');

		// ...but only a lowercase `<style>` is parsed that way, so this one is trimmed as markup
		assert.equal(markup.textContent, 'i{}');
	}
});
