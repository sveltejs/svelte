import { test } from '../../test';

export default test({
	ssrHtml: '<select><option value="a">a</option><option value="b" selected="">b</option></select>',
	test({ assert, target }) {
		const select = /** @type {HTMLSelectElement} */ (target.querySelector('select'));
		assert.equal(select.value, 'b');
	}
});
