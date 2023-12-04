import { test } from '../../test';

export default test({
	test(assert, target) {
		assert.equal(target.querySelector('a')?.getAttribute('href'), '/bar');
	}
});
