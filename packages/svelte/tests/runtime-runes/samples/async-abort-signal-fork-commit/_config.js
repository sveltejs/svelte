import { tick } from 'svelte';
import { test } from '../../test';

const buttons = `
	<button>a++</button>
	<button>b++</button>
	<button>fork</button>
	<button>commit</button>
	<button>discard</button>
	<button>shift</button>
	<button>toggle</button>
`;

// The signal of the committed run should be aborted once the run is replaced. A fork's run doesn't replace it
// when it starts (the fork may be discarded), but when the fork commits. Since each batch has its own signal, the
// fork's run doesn't abort it anymore (before, it aborted it right away, the same on `main`), but the fork's
// commit doesn't either: only the next run of a real batch does (step 3 in getAbortSignalFixes.md)
export default test({
	// TODO see above; not really pressing to fix but would be nice to at some point
	skip: true,
	mode: ['client'],
	async test({ assert, target, logs }) {
		const [inc_a, inc_b, fork, commit, discard, shift, toggle] = target.querySelectorAll('button');

		toggle.click();
		await tick();
		shift.click();
		await tick();
		assert.htmlEqual(target.innerHTML, `${buttons}<p>0/0</p>`);
		assert.deepEqual(logs.splice(0), ['run 0/0']);

		fork.click();
		await tick();
		shift.click();
		await tick();
		assert.htmlEqual(target.innerHTML, `${buttons}<p>0/0</p>`);
		assert.deepEqual(logs.splice(0), ['run 1/0']);

		commit.click();
		await tick();
		assert.htmlEqual(target.innerHTML, `${buttons}<p>1/0</p>`);
		assert.deepEqual(logs.splice(0), ['aborted 0/0']);
	}
});
