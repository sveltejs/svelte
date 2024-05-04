import { test } from '../../assert';

export default test({
	html: `<input type="checkbox" name="lang" value="keep" />`,
	ssrHtml: `<input type="checkbox" name="lang" value="keep" checked />`,
	test({ window, assert, target, mod }) {
		const input = target.querySelector('input');
		assert.equal(input?.checked, true);
	}
});
