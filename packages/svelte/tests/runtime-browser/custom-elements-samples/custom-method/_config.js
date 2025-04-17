import { flushSync } from 'svelte';
import { test } from '../../assert';
const tick = () => Promise.resolve();

export default test({
	async test({ assert, target }) {
		target.innerHTML = '<custom-element></custom-element>';
		await tick();
		/** @type {any} */
		const el = target.querySelector('custom-element');

		el.updateFoo(42);
		flushSync();

		const p = el.shadowRoot.querySelector('p');
		assert.equal(p.textContent, '42');
	}
});
