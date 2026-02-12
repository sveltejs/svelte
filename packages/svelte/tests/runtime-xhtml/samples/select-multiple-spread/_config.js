import { flushSync } from 'svelte';
import { test } from '../../test';

export default test({
	test({ assert, component, target }) {
		const options = target.querySelectorAll('option');

		assert.equal(options[0].selected, true);
		assert.equal(options[1].selected, false);

		// Shouldn't change the value because the value is not bound.
		component.attrs = { value: ['2'] };
		flushSync();

		assert.equal(options[0].selected, false);
		assert.equal(options[1].selected, true);
	}
});
