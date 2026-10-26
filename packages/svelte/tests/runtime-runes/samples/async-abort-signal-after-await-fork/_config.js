import { tick } from 'svelte';
import { test } from '../../test';

const buttons = `
	<button>toggle</button>
	<button>fork</button>
	<button>discard</button>
	<button>shift</button>
`;

// The expression asks for its abort signal after an `await`, so the signal can't be attributed to the run:
// it's the effect's (see "A signal requested after an `await`" in batch-views.md). A fork's run then aborts
// the signal of the committed run, which it doesn't replace (the fork may be discarded), and discarding the
// fork doesn't abort the signal of the fork's run, whose result is never going to be used. (The same on `main`)
export default test({
	// TODO see above
	skip: true,
	mode: ['client'],
	async test({ assert, target, logs }) {
		const [toggle, fork, discard, shift] = target.querySelectorAll('button');

		toggle.click();
		await tick();
		shift.click();
		await tick();
		assert.htmlEqual(target.innerHTML, `${buttons}<p>0</p>`);
		assert.deepEqual(logs.splice(0), ['load 0']);

		fork.click();
		await tick();
		assert.deepEqual(logs.splice(0), ['load 1']);

		discard.click();
		await tick();
		assert.htmlEqual(target.innerHTML, `${buttons}<p>0</p>`);
		assert.deepEqual(logs.splice(0), ['aborted 1']);
	}
});
