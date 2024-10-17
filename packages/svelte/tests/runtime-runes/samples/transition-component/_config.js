import { flushSync } from '../../../../src/index-client.js';
import { test } from '../../test';

/**
 * $.component() should not break transition
 * https://github.com/sveltejs/svelte/issues/13645
 */
export default test({
	test({ assert, raf, target }) {
		const btn = target.querySelector('button');

		// in
		btn?.click();
		flushSync();
		assert.htmlEqual(
			target.innerHTML,
			'<button>toggle</button><p style="opacity: 0;">foo</p><p style="opacity: 0;">foo</p>'
		);

		raf.tick(50);
		assert.htmlEqual(
			target.innerHTML,
			'<button>toggle</button><p style="opacity: 0.5;">foo</p><p style="opacity: 0.5;">foo</p>'
		);

		raf.tick(100);
		assert.htmlEqual(
			target.innerHTML,
			'<button>toggle</button><p style="">foo</p><p style="">foo</p>'
		);
	}
});
