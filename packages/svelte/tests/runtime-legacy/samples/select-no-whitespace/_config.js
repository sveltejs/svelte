import { test } from '../../test';

export default test({
	test({ assert, target }) {
		const select = target.querySelector('select');
		assert.equal(select?.childNodes.length, 3);
	}
});
