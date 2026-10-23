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
// is done. Whichever batch has its result first creates the content, in its own view of the world. The real
// batch commits it with its own result, regardless of who created it — and the fork, once committed, with its own
export default test({
	// TODO when the real batch commits first in "fork first" mode, the fork takes over its result in `#commit`,
	// and then commits it next to its own writes (see "An earlier batch takes over another batch's async result"
	// in batch-views.md)
	skip: true,
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
