import { tick } from 'svelte';
import { test } from '../../test';

export default test({
	async test({ assert, target }) {
		await new Promise((r) => setTimeout(r, 110));
		const btn_a = target.querySelector('button.a');

		/** @type {HTMLButtonElement} */ (btn_a).click();
		await new Promise((r) => setTimeout(r, 10));
		assert.htmlEqual(
			target.innerHTML,
			`
			<p>Loading...</p>
			<button class="b">/b</button>
		`
		);

		const btn_b = target.querySelector('button.b');
		/** @type {HTMLButtonElement} */ (btn_b).click();
		await new Promise((r) => setTimeout(r, 10));
		assert.htmlEqual(
			target.innerHTML,
			`
			<button class="a">/a</button>
			<p>Loading...</p>
		`
		);
	}
});
