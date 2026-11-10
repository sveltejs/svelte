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
	// batch-views: the rest of a script after a top-level `await` isn't created behind a gate like template
	// content is (see `flatten`): it continues once, in the view of the batch that created the component,
	// and only that batch waits for it. So the real batch commits the component before its content exists
	skip: true,
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
				assert.deepEqual(logs.splice(0), first === 'real' ? ['continued with 0'] : []);

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
