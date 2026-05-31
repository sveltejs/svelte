import { test } from '../../assert';

const value = 'line1\nline2\nline3';

export default test({
	mode: ['client'],
	test({ assert, target }) {
		const spread_first = target.querySelector('[data-order="spread-first"]');
		const type_first = target.querySelector('[data-order="type-first"]');

		assert.equal(spread_first?.type, 'hidden');
		assert.equal(spread_first?.value, value);
		assert.equal(type_first?.type, 'hidden');
		assert.equal(type_first?.value, value);
	}
});
