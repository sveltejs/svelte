import { tick } from 'svelte';
import { test } from '../../test';

// This test regresses against batches deactivating other batches than themselves
export default test({
	async test({ assert, target }) {
		await tick(); // settle initial await

		const button = target.querySelector('button');

		button?.click();
		await tick();
		assert.htmlEqual(
			target.innerHTML,
			`
				<div>div</div>
				<p>true</p>
				<button>check</button>
				<p></p>
			`
		);
	}
});
