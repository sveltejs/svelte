import { tick } from 'svelte';
import { test } from '../../test';

const buttons = `
	<button>fork a</button>
	<button>fork b</button>
	<button>reveal</button>
	<button>commit a</button>
	<button>commit b</button>
	<button>reset</button>
`;

// A branch that was created by fork `a` must not show `a`'s values when it is
// revealed by another batch (be it a real one or another fork), and `a` must
// still show its own values when it's committed afterwards
export default test({
	async test({ assert, target }) {
		const [fork_a, fork_b, reveal, commit_a, commit_b, reset] = target.querySelectorAll('button');

		for (const mode of ['real', 'fork']) {
			try {
				fork_a.click();
				await tick();
				assert.htmlEqual(target.innerHTML, buttons);

				if (mode === 'real') {
					reveal.click();
				} else {
					fork_b.click();
					await tick();
					assert.htmlEqual(target.innerHTML, buttons);
					commit_b.click();
				}

				await tick();
				assert.htmlEqual(target.innerHTML, `${buttons}<b>static</b><p>0</p><span>0</span>`);

				commit_a.click();
				await tick();
				assert.htmlEqual(
					target.innerHTML,
					`${buttons}<b>static</b><p>1</p><span>1</span><span>2</span>`
				);

				reset.click();
				await tick();
				assert.htmlEqual(target.innerHTML, buttons);
			} catch (e) {
				/** @type {Error} */ (e).message = `${mode}: ${/** @type {Error} */ (e).message}`;
				throw e;
			}
		}
	}
});
