import { tick } from 'svelte';
import { test } from '../../test';

const buttons = `
	<button>fork</button>
	<button>show</button>
	<button>shift</button>
	<button>pop</button>
	<button>commit</button>
`;

// A real batch adopts a component created by a fork. The script resumes and creates effects in the fork's
// view. When the real batch commits, it must run those effects in its own view without waiting for the fork
// to commit.
export default test({
	mode: ['client'],
	async test({ assert, target, logs }) {
		const [fork, show, shift, pop, commit] = target.querySelectorAll('button');

		fork.click();
		await tick();
		show.click();
		await tick();
		assert.htmlEqual(target.innerHTML, buttons);

		// the fork's result: the script continues in its view
		shift.click();
		await tick();
		assert.htmlEqual(target.innerHTML, buttons);
		assert.deepEqual(logs.splice(0), ['continued with 1']);

		// the real batch's result: it commits, and runs the effect
		pop.click();
		await tick();
		assert.htmlEqual(target.innerHTML, `${buttons}<p>0 0</p>`);
		assert.deepEqual(logs.splice(0), ['effect 0 0', 'created']);

		commit.click();
		await tick();
		assert.htmlEqual(target.innerHTML, `${buttons}<p>1 1</p>`);
		assert.deepEqual(logs.splice(0), ['effect 1 1']);
	}
});
