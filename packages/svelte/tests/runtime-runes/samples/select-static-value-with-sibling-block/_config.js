import { test } from '../../test';

// A `<select>` with a static `value` attribute was wrongly treated as a static
// element when it had a sibling block, so no element reference was created and
// the compiler crashed while building the `__value` assignment. The select
// should still pick the matching option.
export default test({
	mode: ['client'],
	test({ assert, target }) {
		const select = /** @type {HTMLSelectElement} */ (target.querySelector('select'));
		assert.equal(select.value, 'b');
		assert.equal(select.selectedIndex, 1);
	}
});
