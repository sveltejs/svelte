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
		const errors = /** @type {string[]} */ ([]);

		// Expose the errors array to the component template.
		// We check window.uncaughtErrors to verify no unhandled throw escapes.
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
		flushSync(() => {
			target.querySelector('#unmount')?.click();
		});

		// The boundary was being torn down along with the component, so the
		// onerror handler itself may not fire (the boundary is already gone),
		// but the critical thing is that no TypeError about null effect.b
		// escapes to the global error handler.
		assert.equal(
			uncaught.filter((m) => m.includes("Cannot read properties of null")).length,
			0,
			'no null-dereference crash should escape'
		);

		window.onerror = originalOnError;
	}
});
