import { flushSync, tick } from 'svelte';
import { test } from '../../test';

// This test counts mutations on hydration
// set_style() should not mutate style on hydration, except if mismatch
export default test({
	mode: ['server', 'hydrate', 'client'],

	ssrHtml: `
		<button>click</button>
		<div style="background-color: red; font-size: 1em;"></div>
	`,

	html: `
		<button>click</button>
		<div style="background-color: red; font-size: 1em;"></div>
	`,

	async test({ target, assert, component, logs }) {
		flushSync();
		tick();

		assert.deepEqual(logs, ['makeColor()']);

		const btn = target.querySelector('button');
		const div = target.querySelector('div');

		// Note : we cannot compare HTML because set_style() use dom.style.cssText
		// which can alter the format of the attribute...

		assert.equal(div?.style.backgroundColor, 'red');
		assert.equal(div?.style.fontSize, '1em');

		btn?.click();

		flushSync();

		assert.equal(div?.style.backgroundColor, 'red');
		assert.equal(div?.style.fontSize, '2em');
		// only one call here
		assert.deepEqual(logs, ['makeColor()']);
	}
});
