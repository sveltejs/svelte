import { flushSync } from 'svelte';
import { test } from '../../test';

// This test does not fail when the fix is removed, some jsdom/nodejs quirk, this requires browser mode to be tested
export default test({
	html: `<button>switch</button><div>flag : true</div>`,

	test({ assert, target }) {
		const button = target.querySelector('button');

		// Verify initial state - only first div visible
		assert.htmlEqual(
			target.innerHTML,
			`
				<button>switch</button>
				<div>flag : true</div>
			`
		);

		// Click the button
		flushSync(() => button?.click());

		// Verify after click - both divs should be visible
		assert.htmlEqual(
			target.innerHTML,
			`
				<button>switch</button>
				<div>flag : false</div>
				<div>boolElText : false</div>
			`
		);
	}
});
