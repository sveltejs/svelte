import { tick } from 'svelte';
import { test } from '../../test';

// The fork creates Parent, then Child after Parent's script resumes. A real batch adopts both as the fork
// is discarded. Child's `b` reads Parent's `a` via a prop, so it must wait for `a` in the real batch's view.
export default test({
	mode: ['client'],
	async test({ assert, target, logs }) {
		const [fork, resolve_1, discard_real, resolve_3, resolve_13] =
			target.querySelectorAll('button');
		const [output] = target.querySelectorAll('output');
		/** @type {string[]} */
		const steps = [];
		/** @param {string} name */
		const record = (name) =>
			steps.push(
				`${name}: ${output.innerHTML.replace(/<!---->/g, '').trim()} | ${JSON.stringify(logs.splice(0))}`
			);

		for (const [name, button] of [
			['fork', fork],
			['resolve 1', resolve_1],
			['discard and real', discard_real],
			['resolve 3', resolve_3],
			['resolve 13', resolve_13]
		]) {
			/** @type {HTMLButtonElement} */ (button).click();
			await tick();
			record(/** @type {string} */ (name));
		}

		assert.deepEqual(steps, [
			'fork:  | ["load 1"]',
			'resolve 1:  | ["load 11"]',
			'discard and real:  | ["load 3"]',
			'resolve 3:  | ["load 13"]',
			'resolve 13: <p>3 13</p> | []'
		]);
	}
});
