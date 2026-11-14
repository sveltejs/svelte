import { tick } from 'svelte';
import { test } from '../../test';

// A fork writes `x` and `y`, then a real batch writes `x` (with async work still pending), and then the fork is
// committed. The real batch's write comes after the fork's, so it stays the real-world value of `x`: the fork
// commits its own view (`x = 10`, `y = 1`), and the real batch commits `x = 5` after it, or together with it,
// if it's done first (it's merged into the fork then). Nothing runs again
export default test({
	mode: ['client'],
	async test({ assert, target, logs }) {
		await tick();
		const [fork, x5, commit, resolve_10, resolve_5, reset] = target.querySelectorAll('button');
		const p = /** @type {HTMLElement} */ (target.querySelector('p'));

		for (const first of ['fork', 'real']) {
			logs.length = 0;

			fork.click();
			await tick();
			x5.click();
			await tick();
			assert.deepEqual(logs, ['delay 10', 'delay 5']);

			commit.click();
			await tick();
			assert.htmlEqual(p.innerHTML, '0|0|0');

			if (first === 'fork') {
				resolve_10.click();
				await tick();
				assert.htmlEqual(p.innerHTML, '10|10|1');

				resolve_5.click();
				await tick();
				assert.htmlEqual(p.innerHTML, '5|5|1');
			} else {
				resolve_5.click();
				await tick();
				assert.htmlEqual(p.innerHTML, '5|5|1');

				resolve_10.click();
				await tick();
				assert.htmlEqual(p.innerHTML, '5|5|1');
			}

			assert.deepEqual(logs, ['delay 10', 'delay 5']);

			reset.click();
			await tick();
			assert.htmlEqual(p.innerHTML, '0|0|0');
		}
	}
});
