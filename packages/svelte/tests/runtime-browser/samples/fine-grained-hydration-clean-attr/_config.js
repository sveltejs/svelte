import { test } from '../../assert';

export default test({
	html: `<input type="checkbox" name="lang" value="keep" checked />`,
	mode: ['server'],
	test({ window, assert, mod }) {
		assert.htmlEqual(
			window.document.body.innerHTML,
			`<input type="checkbox" name="lang" value="keep" />`
		);
	}
});
