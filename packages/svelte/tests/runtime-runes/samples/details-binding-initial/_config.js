import { ok, test } from '../../test';

export default test({
	test({ assert, target }) {
		const details_el = target.querySelector('details');

		ok(details_el);

		assert.strictEqual(details_el.open, true);
	}
});
