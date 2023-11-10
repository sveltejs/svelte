import { test } from '../../test';

export default test({
	html: '<span>&nbsp;</span>',

	test({ assert, target }) {
		const text = target.querySelector('span')?.textContent;
		assert.equal(text?.charCodeAt(0), 160);
	}
});
