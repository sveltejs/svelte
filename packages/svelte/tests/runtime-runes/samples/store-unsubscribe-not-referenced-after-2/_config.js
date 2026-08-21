import { tick } from 'svelte';
import { ok, test } from '../../test';

// Test that the store is unsubscribed from, even if it's not referenced once the store itself is set to null
export default test({
	skip_no_async: true,

	async test({ target, assert }) {
		assert.htmlEqual(
			target.innerHTML,
			`<input type="number"> <p>0</p> <button>add watcher</button>`
		);

		target.querySelector('button')?.click();
		await tick();
		assert.htmlEqual(
			target.innerHTML,
			`<input type="number"> <p>1</p> hello 1 <button>remove watcher</button>`
		);

		const input = target.querySelector('input');
		ok(input);

		input.stepUp();
		input.dispatchEvent(new Event('input', { bubbles: true }));
		await tick();
		assert.htmlEqual(
			target.innerHTML,
			`<input type="number"> <p>2</p> hello 2 <button>remove watcher</button>`
		);

		target.querySelector('button')?.click();
		await tick();
		assert.htmlEqual(
			target.innerHTML,
			`<input type="number"> <p>2</p> <button>add watcher</button>`
		);

		input.stepUp();
		input.dispatchEvent(new Event('input', { bubbles: true }));
		await tick();
		assert.htmlEqual(
			target.innerHTML,
			`<input type="number"> <p>2</p> <button>add watcher</button>`
		);

		target.querySelector('button')?.click();
		await tick();
		assert.htmlEqual(
			target.innerHTML,
			`<input type="number"> <p>3</p> hello 3 <button>remove watcher</button>`
		);
	}
});
