import { test } from '../../test';

export default test({
	test({ assert, window }) {
		assert.equal(window.document.title, '');
	}
});
