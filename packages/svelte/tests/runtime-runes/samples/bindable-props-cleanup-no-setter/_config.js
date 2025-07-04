import { flushSync } from 'svelte';
import { test } from '../../test';

export default test({
	async test({ assert, logs, target }) {
		/** @type {HTMLButtonElement | null} */
		const increment_btn = target.querySelector('#increment');
		/** @type {HTMLButtonElement | null} */
		const toggle_btn = target.querySelector('#toggle');

		for (const p of target.querySelectorAll('p')) {
			assert.equal(p.innerHTML, 'Count: 0');
		}

		// Click increment: count=1
		flushSync(() => {
			increment_btn?.click();
		});

		for (const p of target.querySelectorAll('p')) {
			assert.equal(p.innerHTML, 'Count: 1');
		}

		// Click increment again: count=2, components with count < 2 should unmount and log old values
		flushSync(() => {
			increment_btn?.click();
		});

		for (const p of target.querySelectorAll('p')) {
			assert.equal(p.innerHTML, 'Count: 2');
		}

		// Toggle show to hide components that depend on show
		flushSync(() => {
			toggle_btn?.click();
		});

		// Should log old values during cleanup from the six components guarded by `count < 2`:
		// 1. Component with bind: "1 true"
		// 2. Component with spread: "1 true"
		// 3. Component with normal props: "1 true"
		// 4. Runes dynamic component with bind: "1 true"
		// 5. Runes dynamic component with spread: "1 true"
		// 6. Runes dynamic component with normal props: "1 true"
		// Then from the four components guarded by `show`:
		// 7. Component with bind (show): "2 true" (old value of checked)
		// 8. Runes dynamic component with bind (show): "2 true"
		// 9. Runes dynamic component with spread (show): "2 true"
		// 10. Runes dynamic component with normal props (show): "2 true"
		assert.deepEqual(logs, [
			'1 true',
			'1 true',
			'1 true',
			'1 true',
			'1 true',
			'1 true',
			'2 true',
			'2 true',
			'2 true',
			'2 true'
		]);
	}
});
