import { test } from '../../test';

// sum is declared before left/right; sort_const_tags must emit deps first.
// Also exercises multi-parent membership (sum → left and sum → right).
export default test({
	html: '<p>23</p>',

	async test({ component, target, assert }) {
		component.n = 1;

		assert.htmlEqual(target.innerHTML, '<p>5</p>');
	}
});
