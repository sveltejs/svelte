import { tick } from 'svelte';
import { test } from '../../test';

const buttons = `
	<button>increment</button>
	<button>fork</button>
	<button>commit</button>
	<button>discard</button>
`;

// A fork's run replaces the real world's run when the fork commits, and a discarded fork's run is
// obsolete right away. Both abort the signal of the run they supersede, rather than waiting for the
// effect to run again outside the fork
export default test({
	mode: ['client'],
	async test({ assert, target, logs }) {
		const [increment, fork, commit, discard] = target.querySelectorAll('button');

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

		// discarding the fork aborts the run in its view
		discard.click();
		await tick();
		assert.htmlEqual(target.innerHTML, `${buttons}1`);
		assert.deepEqual(logs.splice(0), ['aborted 2']);

		increment.click();
		await tick();
		assert.htmlEqual(target.innerHTML, `${buttons}2`);
		assert.deepEqual(logs.splice(0), ['aborted 1', 'started 2']);

		fork.click();
		await tick();
		assert.htmlEqual(target.innerHTML, `${buttons}2`);
		assert.deepEqual(logs.splice(0), ['started 3']);

		// ...but committing the fork does, so the run it replaces aborts
		commit.click();
		await tick();
		assert.htmlEqual(target.innerHTML, `${buttons}3`);
		assert.deepEqual(logs.splice(0), ['aborted 2']);
	}
});
