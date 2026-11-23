import { tick } from 'svelte';
import { test } from '../../test';

const buttons = `
	<button>b</button>
	<button>a</button>
	<button>fork a</button>
	<button>x0</button>
	<button>x1</button>
	<button>y</button>
	<button>commit</button>
	<button>reset</button>
`;

// Batch A shows a branch with `{#if await ...}` in it, then B (a real batch, or a fork) shows it, too. B has its
// result first, and creates the block in its view, where `x` is 1 (`y` keeps a real B from committing it). Once
// A has its own result, it adopts the block, and has to re-validate it in its own view, where `x` is 0, rather
// than committing B's `x` — next to its own `x` elsewhere
export default test({
	mode: ['client'],
	async test({ assert, target }) {
		await tick();
		const [b, a, fork_a, x0, x1, y, commit, reset] = target.querySelectorAll('button');

		for (const mode of ['real', 'fork']) {
			try {
				for (const button of [b, mode === 'real' ? a : fork_a, x1]) {
					button.click();
					await tick();
					assert.htmlEqual(target.innerHTML, `${buttons}<i>0</i><b>0</b>`);
				}

				// A's result
				x0.click();
				await tick();
				assert.htmlEqual(target.innerHTML, `${buttons}<i>0</i><b>0</b><p>x is 0</p>`);

				y.click();
				await tick();
				commit.click();
				await tick();
				assert.htmlEqual(target.innerHTML, `${buttons}<i>1</i><b>1</b><p>x is 1</p>`);

				reset.click();
				await tick();
				assert.htmlEqual(target.innerHTML, `${buttons}<i>0</i><b>0</b>`);
			} catch (e) {
				/** @type {Error} */ (e).message = `${mode}: ${/** @type {Error} */ (e).message}`;
				throw e;
			}
		}
	}
});
