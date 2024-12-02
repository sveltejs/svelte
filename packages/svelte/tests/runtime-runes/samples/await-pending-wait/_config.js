import { flushSync } from 'svelte';
import { test } from '../../test';

export default test({
	async test({ assert, target }) {
		const [b1, b2, b3] = target.querySelectorAll('button');

		// not flushing means we wait a tick before showing the pending state ...
		b2.click();
		await Promise.resolve();
		assert.htmlEqual(
			target.innerHTML,
			`<button>Clear</button> <button>Immediate</button> <button>Takes time</button>`
		);

		// ... and show the then state directly if the promise resolved by then
		await Promise.resolve();
		assert.htmlEqual(
			target.innerHTML,
			`<button>Clear</button> <button>Immediate</button> <button>Takes time</button> then`
		);

		// reset
		b1.click();
		flushSync();
		assert.htmlEqual(
			target.innerHTML,
			`<button>Clear</button> <button>Immediate</button> <button>Takes time</button>`
		);

		// flushing means we show the pending state immediately
		b2.click();
		flushSync();
		assert.htmlEqual(
			target.innerHTML,
			`<button>Clear</button> <button>Immediate</button> <button>Takes time</button> pending`
		);

		await Promise.resolve();
		b1.click();
		flushSync();
		assert.htmlEqual(
			target.innerHTML,
			`<button>Clear</button> <button>Immediate</button> <button>Takes time</button>`
		);

		// when not flushing ...
		b3.click();
		await Promise.resolve();
		assert.htmlEqual(
			target.innerHTML,
			`<button>Clear</button> <button>Immediate</button> <button>Takes time</button>`
		);

		// ... we show the pending state after a tick when the promise hasn't resolved by then
		await Promise.resolve();
		assert.htmlEqual(
			target.innerHTML,
			`<button>Clear</button> <button>Immediate</button> <button>Takes time</button> pending`
		);

		await new Promise((r) => setTimeout(r, 110));
		assert.htmlEqual(
			target.innerHTML,
			`<button>Clear</button> <button>Immediate</button> <button>Takes time</button> then`
		);
	}
});
