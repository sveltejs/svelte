import { flushSync } from 'svelte';
import { test } from '../../test';

export default test({
	// Regression test for https://github.com/sveltejs/svelte/issues/18485.
	// A $derived that re-executes and throws during teardown should not crash
	// with "Cannot read properties of null (reading 'error')" and should not
	// mask the real error.
	html: '<button id="break">break</button><button id="unmount">unmount</button><span>trigger</span>',
	mode: ['client'],

	test({ assert, target, window }) {
		const originalOnError = window.onerror;
		/** @type {string[]} */
		const uncaught = [];
		window.onerror = (msg) => {
			uncaught.push(String(msg));
			return true;
		};

		// Step 1: make appContext dirty without triggering an immediate throw.
		flushSync(() => {
			target.querySelector('#break')?.click();
		});

		// Step 2: unmount — teardown reads the dirty derived, which throws.
		// The boundary is being torn down together with the component, so the
		// real TypeError may escape synchronously from flushSync (no live
		// boundary ancestor can catch it). That is acceptable. What must NOT
		// happen is a secondary null-dereference crash about a destroyed
		// boundary's error handler ("Cannot read properties of null (reading 'error')").
		/** @type {unknown} */
		let teardownError = null;
		try {
			flushSync(() => {
				target.querySelector('#unmount')?.click();
			});
		} catch (e) {
			teardownError = e;
		}

		// The real error about null.value is fine — it's the expected throw.
		// The null-dereference about effect.b.error is the regression we guard.
		const nullDerefMsg = "Cannot read properties of null (reading 'error')";

		if (teardownError) {
			assert.ok(
				!String(/** @type {any} */ (teardownError).message).includes(nullDerefMsg),
				'no null-dereference crash about effect.b should escape synchronously'
			);
		}

		assert.equal(
			uncaught.filter((m) => m.includes(nullDerefMsg)).length,
			0,
			'no null-dereference crash about effect.b should escape to window.onerror'
		);

		window.onerror = originalOnError;
	}
});
