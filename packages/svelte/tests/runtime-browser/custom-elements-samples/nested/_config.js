import { flushSync } from 'svelte';
import { test } from '../../assert';
const tick = () => Promise.resolve();

export default test({
	async test({ assert, target }) {
		target.innerHTML = '<my-app/>';
		await tick();
		await tick();
		/** @type {any} */
		const el = target.querySelector('my-app');
		const button = el.shadowRoot.querySelector('button');
		const span = el.shadowRoot.querySelector('span');
		const p = el.shadowRoot.querySelector('p');

		assert.equal(el.counter.count, 0);
		assert.equal(button.innerHTML, 'count: 0');
		assert.equal(span.innerHTML, 'slot 0');
		assert.equal(p.innerHTML, 'Context works');
		assert.equal(getComputedStyle(button).color, 'rgb(255, 0, 0)');

		button.dispatchEvent(new MouseEvent('click', { bubbles: true }));
		flushSync();

		assert.equal(el.counter.count, 1);
		assert.equal(button.innerHTML, 'count: 1');
		assert.equal(span.innerHTML, 'slot 1');
	}
});
