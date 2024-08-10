import { flushSync } from 'svelte';
import { test } from '../../assert';
const tick = () => Promise.resolve();

export default test({
	async test({ assert, target }) {
		target.innerHTML = '<custom-element></custom-element>';
		await tick();
		await tick();

		/** @type {any} */
		const el = target.querySelector('custom-element');
		const button = el.shadowRoot.querySelector('button');

		assert.equal(button.textContent, '0');
		assert.equal(el.count, 0);

		button.click();

		flushSync();

		assert.equal(button.textContent, '1');
		assert.equal(el.count, 1);

		el.count = 0;

		assert.equal(button.textContent, '0');
		assert.equal(el.count, 0);

		button.click();

		flushSync();

		assert.equal(button.textContent, '1');
		assert.equal(el.count, 1);
	}
});
