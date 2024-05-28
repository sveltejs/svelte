import { flushSync } from 'svelte';
import { test } from '../../test';

// Tests that fallback value is propagated up correctly when the inner component
// uses a prop it does not write to but has a fallback value
export default test({
	accessors: false, // so that prop actually becomes $.prop and not $.prop_source
	html: `<button>0</button><span>0</span>`,

	test({ assert, target }) {
		const btn = target.querySelector('button');

		btn?.click();
		flushSync();

		assert.htmlEqual(target.innerHTML, `<button>1</button><span>1</span>`);
	},

	error: 'props_invalid_value\nCannot do `bind:count={undefined}` when `count` has a fallback value'
});
