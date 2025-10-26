import { test } from '../../test';

export default test({
	expect_hydration_error: true,
	test(assert, target, snapshot, component, window) {
		assert.equal(window.document.querySelectorAll('meta').length, 2);
	}
});
