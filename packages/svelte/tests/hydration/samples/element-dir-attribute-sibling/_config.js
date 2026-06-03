import { test } from '../../test';

export default test({
	test(assert, target) {
		const p = target.querySelector('p');

		assert.equal(p?.dir, 'rtl');
	}
});
