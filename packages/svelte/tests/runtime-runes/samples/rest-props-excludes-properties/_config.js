import { test } from '../../test';

export default test({
	async test({ assert, target }) {
		assert.equal(target.textContent, ' false');
	}
});
