import { test } from '../../test';

// Tests that fallback value is propagated up correctly when the inner component
// uses a prop it does not write to but has a fallback value
export default test({
	accessors: false, // so that prop actually becomes $.prop and not $.prop_source
	html: `<button>0</button><span>0</span>`,

	async test({ assert, target }) {
		const btn = target.querySelector('button');

		await btn?.click();

		assert.htmlEqual(target.innerHTML, `<button>1</button><span>1</span>`);
	},

	error: `ERR_SVELTE_BINDING_FALLBACK: Cannot pass undefined to bind:count because the property contains a fallback value. Pass a different value than undefined to count.`
});
