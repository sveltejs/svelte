import { tick } from 'svelte';
import { test } from '../../test';

export default test({
	// this test doesn't fail without the associated fix — the error gets
	// swallowed somewhere. but keeping it around for illustration
	skip: true,

	mode: ['client'],

	async test({ assert, target, errors, logs }) {
		const button = target.querySelector('button');

		button?.click();
		await tick();
		await tick();
		assert.deepEqual(logs, ['Simulated TypeError']);
		assert.deepEqual(errors, []);

		assert.htmlEqual(
			target.innerHTML,
			`
				<button>Trigger</button>
				<p>Error Caught: Simulated TypeError</p>
			`
		);
	}
});
