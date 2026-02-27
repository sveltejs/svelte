import { tick } from 'svelte';
import { test } from '../../test';

export default test({
	async test({ assert, target }) {
		await tick();
		const resolve = /** @type {HTMLButtonElement} */ (target.querySelector('button'));
		const btn_a = /** @type {HTMLButtonElement} */ (target.querySelector('button.a'));

		btn_a.click();
		await tick();
		assert.htmlEqual(
			target.innerHTML,
			`
			<button>resolve</button>
			<p>Loading...</p>
			<button class="b">/b</button>
		`
		);

		const btn_b = /** @type {HTMLButtonElement} */ (target.querySelector('button.b'));
		btn_b.click();
		await tick();
		assert.htmlEqual(
			target.innerHTML,
			`
			<button>resolve</button>
			<button class="a">/a</button>
			<p>Loading...</p>
		`
		);

		resolve.click();
		await tick();
		assert.htmlEqual(
			target.innerHTML,
			`
			<button>resolve</button>
			<button class="a">/a</button>
			<p>Loading...</p>
			/a
		`
		);

		resolve.click();
		await tick();
		assert.htmlEqual(
			target.innerHTML,
			`
			<button>resolve</button>
			<button class="a">/a</button>
			<button class="b">/b</button>
			/b
		`
		);
	}
});
