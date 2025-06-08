import { test } from '../../test';
import { flushSync, tick } from 'svelte';

export default test({
	async test({ assert, target }) {
		assert.htmlEqual(
			target.innerHTML,
			`
			<button id="step1">step1</button>
			<button id="step2">step2</button>
			<button id="step3">step3</button>
			<p>0</p>
		`
		);

		const step1 = /** @type {HTMLButtonElement | null} */ (target.querySelector('#step1'));
		const step2 = /** @type {HTMLButtonElement | null} */ (target.querySelector('#step2'));
		const step3 = /** @type {HTMLButtonElement | null} */ (target.querySelector('#step3'));

		// Step 1: hide and reset data
		step1?.click();
		await tick();
		assert.htmlEqual(
			target.innerHTML,
			`
			<button id="step1">step1</button>
			<button id="step2">step2</button>
			<button id="step3">step3</button>
		`
		);

		// Step 2: show again
		step2?.click();
		await tick();
		assert.htmlEqual(
			target.innerHTML,
			`
			<button id="step1">step1</button>
			<button id="step2">step2</button>
			<button id="step3">step3</button>
			<p>0</p>
		`
		);

		// Step 3: update override - this should show 2, not 0 (the bug)
		step3?.click();
		await tick();
		assert.htmlEqual(
			target.innerHTML,
			`
			<button id="step1">step1</button>
			<button id="step2">step2</button>
			<button id="step3">step3</button>
			<p>2</p>
		`
		);
	}
});
