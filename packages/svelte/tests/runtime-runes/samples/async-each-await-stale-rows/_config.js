import { tick } from 'svelte';
import { test } from '../../test';

export default test({
	async test({ assert, target }) {
		const spam = /** @type {HTMLButtonElement} */ (target.querySelector('button.spam'));
		const resolve = /** @type {HTMLButtonElement} */ (target.querySelector('button.resolve'));

		resolve.click();
		await tick();

		for (let i = 0; i < 5; i += 1) {
			spam.click();
			await tick();
		}

		for (let i = 0; i < 5; i += 1) {
			resolve.click();
			await tick();
		}

		assert.equal(target.querySelectorAll('div').length, 1);
		assert.htmlEqual(
			target.innerHTML,
			`
				<button class="spam">Spam</button>
				<button class="resolve">Resolve</button>
				<div>5</div>
			`
		);
	}
});
