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

// Like `async-resume-template-expression`, with a top-level `await` in a component's script: the script
// continues in the view of the real batch, once it has its result. What it computes imperatively is that
// batch's (it only runs once), what's reactive is up to date in every batch's view
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
				assert.htmlEqual(target.innerHTML, first === 'real' ? buttons : buttons);
				assert.deepEqual(logs.splice(0), first === 'real' ? [] : ['continued with 1']);

				(first === 'real' ? shift : pop).click();
				await tick();
				assert.htmlEqual(target.innerHTML, `${buttons}<p>0 0</p>`);
				assert.deepEqual(logs.splice(0), first === 'real' ? ['continued with 1'] : []);

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
