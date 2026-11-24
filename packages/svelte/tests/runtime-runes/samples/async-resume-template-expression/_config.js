import { tick } from 'svelte';
import { test } from '../../test';

const buttons = `
	<button>fork</button>
	<button>show</button>
	<button>shift</button>
	<button>pop</button>
	<button>commit</button>
	<button>reset</button>
`;

// A fork creates a branch with `{await ...}` in it, and a real batch reveals it before either of their runs
// is done. Each batch needs its own result to get to the content (see `flatten`), and the first one that has it
// creates the content. The real batch commits it once it has its own result, and with that result — even if
// the fork's is there first, as that isn't part of the real world — and the fork, once committed, with its own
export default test({
	mode: ['client'],
	async test({ assert, target }) {
		const [fork, show, shift, pop, commit, reset] = target.querySelectorAll('button');

		for (const first of ['real', 'fork']) {
			try {
				fork.click();
				await tick();
				show.click();
				await tick();
				assert.htmlEqual(target.innerHTML, buttons);

				// the fork's run is first in the queue, the real batch's last
				(first === 'real' ? pop : shift).click();
				await tick();
				assert.htmlEqual(target.innerHTML, first === 'real' ? `${buttons}<p>0</p>` : buttons);

				(first === 'real' ? shift : pop).click();
				await tick();
				assert.htmlEqual(target.innerHTML, `${buttons}<p>0</p>`);

				commit.click();
				await tick();
				assert.htmlEqual(target.innerHTML, `${buttons}<p>1</p>`);

				reset.click();
				await tick();
				assert.htmlEqual(target.innerHTML, buttons);
			} catch (e) {
				/** @type {Error} */ (e).message = `${first} first: ${/** @type {Error} */ (e).message}`;
				throw e;
			}
		}
	}
});
