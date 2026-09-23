import { test } from '../../test';

export default test({
	test(assert, target) {
		const button = target.querySelector('button');

		// `disabled="disabled"` is equivalent but not identical to what the client stores, so it is rewritten
		assert.equal(button?.getAttribute('disabled'), '');
		assert.equal(button?.getAttribute('hidden'), '');
		assert.equal(button?.disabled, true);
	}
});
