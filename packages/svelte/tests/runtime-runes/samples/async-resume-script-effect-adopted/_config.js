import { tick } from 'svelte';
import { test } from '../../test';

const buttons = `
	<button>fork</button>
	<button>show</button>
	<button>shift</button>
	<button>pop</button>
	<button>commit</button>
`;

// A fork creates a component with an `await` in its script, and a real batch reveals it, too. The script continues
// in the fork's view, which is where the effects that it creates are scheduled. The real batch, which waits for the
// script, runs them in its own view when it commits — not only the fork, once it commits
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
		assert.deepEqual(logs.splice(0), ['effect 0 0']);

		commit.click();
		await tick();
		assert.htmlEqual(target.innerHTML, `${buttons}<p>1 1</p>`);
		assert.deepEqual(logs.splice(0), ['effect 1 1']);
	}
});
