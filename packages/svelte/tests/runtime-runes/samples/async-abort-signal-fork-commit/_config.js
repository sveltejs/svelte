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

// The signal of the committed run is aborted once the run is replaced. A fork's run doesn't replace it when it
// starts (the fork may be discarded), but when the fork commits. Currently, it's only aborted by the next run
// of a real batch (or when the effect is destroyed). (On `main`, the fork's run aborts it right away)
export default test({
	// TODO see above
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
