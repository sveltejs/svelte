import { flushSync } from 'svelte';
import { test } from '../../test';

export default test({
	html: `
		normal content
		<button>toggle</button>
	`,

	expect_unhandled_rejections: true,

	async test({ assert, target, warnings, window }) {
		// @ts-expect-error
		const __expected_error = (window.__expected_error = { v: false });

		window.addEventListener('error', (e) => {
			// @ts-expect-error when in hydrate mode we can't access variables in the scope
			const __expected_error = window.__expected_error;

			if (__expected_error.v) {
				assert.include(e.error.message, 'error on template render');
			} else {
				assert.fail('Error was not expected: ' + e.error.message);
			}
			e.preventDefault();
		});

		const btn = target.querySelector('button');

		// 1st click — error caught, fallback visible
		btn?.click();
		flushSync();
		assert.htmlEqual(target.innerHTML, `<div>err</div><button>toggle</button>`);

		// 2nd click — reset succeeds, normal render
		btn?.click();
		flushSync();
		assert.htmlEqual(
			target.innerHTML,
			`
				normal content
				<button>toggle</button>
			`
		);

		// 3rd click — mount-time crash escapes, boundary empty
		__expected_error.v = true;
		btn?.click();
		flushSync();
		__expected_error.v = false;

		// Check that the warning is being showed to the user
		assert.include(warnings[0], 'reset() was invoked');

		// boundary content empty; only button remains
		assert.htmlEqual(target.innerHTML, `<button>toggle</button>`);
	}
});
