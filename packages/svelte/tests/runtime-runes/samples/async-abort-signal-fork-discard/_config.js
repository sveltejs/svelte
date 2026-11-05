import { tick } from 'svelte';
import { test } from '../../test';

const buttons = `
	<button>increment</button>
	<button>fork</button>
	<button>commit</button>
	<button>discard</button>
`;

// Discarding a fork aborts the signals of the runs in its view right away, rather than
// waiting for the effect to run again outside the fork
export default test({
	mode: ['client'],
	async test({ assert, target, logs }) {
		const [increment, fork, , discard] = target.querySelectorAll('button');

		await tick();
		assert.htmlEqual(target.innerHTML, `${buttons}0`);
		assert.deepEqual(logs.splice(0), ['started 0']);

		increment.click();
		await tick();
		assert.htmlEqual(target.innerHTML, `${buttons}1`);
		assert.deepEqual(logs.splice(0), ['aborted 0', 'started 1']);

		fork.click();
		await tick();
		assert.htmlEqual(target.innerHTML, `${buttons}1`);
		assert.deepEqual(logs.splice(0), ['started 2']);

		// the fork's run is aborted as soon as it's discarded
		discard.click();
		await tick();
		assert.htmlEqual(target.innerHTML, `${buttons}1`);
		assert.deepEqual(logs.splice(0), ['aborted 2']);
	}
});
