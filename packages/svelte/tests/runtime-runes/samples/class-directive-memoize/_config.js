import { flushSync, tick } from 'svelte';
import { test } from '../../test';

// This test counts mutations on hydration
// set_style() should not mutate style on hydration, except if mismatch
export default test({
	mode: ['server', 'hydrate', 'client'],

	ssrHtml: `
		<button>click</button>
		<div class="red"></div>
	`,

	html: `
		<button>click</button>
		<div class="red"></div>
	`,

	async test({ target, assert, logs }) {
		flushSync();
		tick();

		assert.deepEqual(logs, ['is_red()']);

		const btn = target.querySelector('button');
		const div = target.querySelector('div');

		assert.equal(div?.className, 'red');

		btn?.click();

		flushSync();

		assert.equal(div?.className, 'red active');
		// only one call here
		assert.deepEqual(logs, ['is_red()']);
	}
});
