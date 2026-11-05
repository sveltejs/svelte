import { tick } from 'svelte';
import { test } from '../../test';

const buttons = `
	<button>increment</button>
	<button>fork</button>
	<button>commit</button>
	<button>discard</button>
`;

// A fork's run replaces the real world's run once the fork commits, which aborts the
// signal of the run it replaced
export default test({
	mode: ['client'],
	async test({ assert, target, logs }) {
		const [increment, fork, commit] = target.querySelectorAll('button');

		await tick();
		assert.htmlEqual(target.innerHTML, `${buttons}0`);
		assert.deepEqual(logs.splice(0), ['started 0']);

		increment.click();
		await tick();
		assert.htmlEqual(target.innerHTML, `${buttons}1`);
		assert.deepEqual(logs.splice(0), ['aborted 0', 'started 1']);

		// the fork's run doesn't replace the real world's run yet (the fork may be discarded)
		fork.click();
		await tick();
		assert.htmlEqual(target.innerHTML, `${buttons}1`);
		assert.deepEqual(logs.splice(0), ['started 2']);

		// ...but committing it does
		commit.click();
		await tick();
		assert.htmlEqual(target.innerHTML, `${buttons}2`);
		assert.deepEqual(logs.splice(0), ['aborted 1']);
	}
});
