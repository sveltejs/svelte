import { flushSync } from 'svelte';
import { test } from '../../assert';
const tick = () => Promise.resolve();

export default test({
	async test({ assert, target }) {
		const element = document.createElement('custom-element');
		target.appendChild(element);
		await tick();
		flushSync();

		/** @type {any} */
		const el = target.querySelector('custom-element');
		el.shadowRoot.querySelector('button').click();
		await tick();
		flushSync();

		assert.equal(el.getAttribute('aria-expanded'), '');
		el.shadowRoot.querySelector('button').click();
		await tick();
		flushSync();

		assert.equal(el.getAttribute('aria-expanded'), null);
	}
});
