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

// Like `async-resume-template-expression`, with a block that awaits its expression: the real batch commits
// the block in its own view (`no 0`), whether its own result or the fork's is there first — and the fork,
// once committed, in its own (`yes 1`)
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
				assert.htmlEqual(target.innerHTML, first === 'real' ? `${buttons}<p>no 0</p>` : buttons);

				(first === 'real' ? shift : pop).click();
				await tick();
				assert.htmlEqual(target.innerHTML, `${buttons}<p>no 0</p>`);

				commit.click();
				await tick();
				assert.htmlEqual(target.innerHTML, `${buttons}<p>yes 1</p>`);

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
