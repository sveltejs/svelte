import { flushSync } from 'svelte';
import { test } from '../../test';

// Test that components can be used inside <option> elements.
// This tests two scenarios:
// 1. A component that wraps the entire <option> element
// 2. A component used as content inside an <option> element
//
// In jsdom (which doesn't support rich options), the HTML content is stripped,
// so we only verify the component doesn't crash and values work correctly.
export default test({
	test({ assert, target }) {
		const option1 = target.querySelector('option');
		const button = target.querySelector('button');

		assert.ok(option1);

		assert.equal(option1?.textContent, 'bb');

		flushSync(() => {
			button?.click();
		});

		assert.equal(option1?.textContent, 'aa');
	}
});
