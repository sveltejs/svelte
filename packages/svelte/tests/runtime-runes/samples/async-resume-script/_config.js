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

// Each view initializes independently. A ready real attempt can publish without
// waiting for the fork, while a ready fork stays invisible until commit. Once R
// publishes, an unfinished healthy F adopts it instead of running its old suffix.
// Continuations that do execute read their own value; reactive updates stay live.
export default test({
	mode: ['client'],
	async test({ assert, target, logs }) {
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
				assert.htmlEqual(target.innerHTML, first === 'real' ? `${buttons}<p>0 0</p>` : buttons);
				assert.deepEqual(logs.splice(0), [`continued with ${first === 'real' ? 0 : 1}`]);

				(first === 'real' ? shift : pop).click();
				await tick();
				assert.htmlEqual(target.innerHTML, `${buttons}<p>0 0</p>`);
				assert.deepEqual(logs.splice(0), first === 'real' ? [] : ['continued with 0']);

				commit.click();
				await tick();
				assert.htmlEqual(target.innerHTML, `${buttons}<p>1 10</p>`);

				reset.click();
				await tick();
				assert.htmlEqual(target.innerHTML, buttons);
				assert.deepEqual(logs, []);
			} catch (e) {
				/** @type {Error} */ (e).message = `${first} first: ${/** @type {Error} */ (e).message}`;
				throw e;
			}
		}
	}
});
