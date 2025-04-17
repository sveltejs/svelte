import { test } from '../../test';

export default test({
	test(assert, target) {
		const input = target.querySelector('input');

		assert.equal(input?.checked, true);
	}
});
