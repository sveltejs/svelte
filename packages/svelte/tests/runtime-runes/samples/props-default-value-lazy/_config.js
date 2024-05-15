import { tick } from 'svelte';
import { test } from '../../test';

// Tests that default values only fire lazily when the prop is undefined, and every time
export default test({
	html: `
	<p>props: 0 0 0 0 1 1 1 1</p>
	<p>log: nested.fallback_value,fallback_fn</p>
	<button>Set all to undefined</button>
	`,
	async test({ assert, target }) {
		const btn = target.querySelector('button');
		btn?.click();
		await tick();
		assert.htmlEqual(
			target.innerHTML,
			`
			<p>props: 1 1 1 1 1 1 1 1</p>
			<p>log: nested.fallback_value,fallback_fn,nested.fallback_value,fallback_fn</p>
			<button>Set all to undefined</button>
			`
		);
	}
});
