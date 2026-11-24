import { tick } from 'svelte';
import { test } from '../../test';

const buttons = `
	<button>a</button>
	<button>b</button>
	<button>shift</button>
`;

// Like `async-resume-unrelated-batch`, with `{#if b && !a}` next to the branch that A (`a = true`) created and
// B (`b = true`) reveals. B's view undoes A's write: `b && !a` holds there, so B creates the branch and runs
// its expression, once (`only b 0`). Once A commits, B's view has A's write: the branch isn't selected anymore,
// and isn't shown when B commits. Only the expression that B adopted runs again (`x 1`)
export default test({
	mode: ['client'],
	async test({ assert, target, logs }) {
		const [a, b, shift] = target.querySelectorAll('button');

		a.click();
		await tick();
		assert.deepEqual(logs.splice(0), ['x 1']);

		b.click();
		await tick();
		assert.htmlEqual(target.innerHTML, buttons);
		assert.deepEqual(logs.splice(0), ['only b 0', 'x 0']);

		// A's run: A creates the content and commits
		shift.click();
		await tick();
		assert.htmlEqual(target.innerHTML, `${buttons}<p>1 1</p>`);
		assert.deepEqual(logs.splice(0), ['x 1']);

		// B's runs (only the last one, with A's `x`, is still current): B commits
		for (let i = 0; i < 3; i += 1) {
			shift.click();
			await tick();
			assert.htmlEqual(target.innerHTML, `${buttons}<p>1 1</p>`);
		}

		assert.deepEqual(logs.splice(0), []);
	}
});
