import { test } from '../../test';

export default test({
	test({ assert, target }) {
		assert.equal(target.ownerDocument.title, '');
	}
});
