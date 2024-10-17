import { test } from '../../test';

export default test({
	async test({ assert, target, window }) {
		assert.equal(target.querySelector('input'), window.document.activeElement);
	}
});
