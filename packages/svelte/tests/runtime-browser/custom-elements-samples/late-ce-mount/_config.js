import { flushSync } from 'svelte';
import { test } from '../../assert';

const tick = () => Promise.resolve();

// Check that rendering a custom element and setting a property before it is registered
// does not break the "when to set this as a property" logic
export default test({
	async test({ assert, target }) {
		target.innerHTML = '<custom-element></custom-element>';
		await tick();
		await tick();

		const ce_root = target.querySelector('custom-element').shadowRoot;

		ce_root.querySelector('button')?.click();
		flushSync();
		await tick();
		await tick();

		const inner_ce_root = ce_root.querySelectorAll('set-property-before-mounted');
		assert.htmlEqual(inner_ce_root[0].shadowRoot.innerHTML, 'object|{"foo":"bar"}');
		assert.htmlEqual(inner_ce_root[1].shadowRoot.innerHTML, 'object|{"foo":"bar"}');
	}
});
