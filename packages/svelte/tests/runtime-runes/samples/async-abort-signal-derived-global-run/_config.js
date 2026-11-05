import { tick } from 'svelte';
import { test } from '../../test';

const buttons = `
	<button>n++</button>
	<button>m++</button>
	<button>shift</button>
	<button>show</button>
	<button>load</button>
`;

// A derived's run that happens while a batch is current, but becomes its global state, owns the global state's
// signal — not the batch's. Before, the signal was keyed by the batch, so the batch's next run of the derived
// in its own view (which became a record of the batch) aborted it, although the real world still used that run.
// Reading the derived in the real world then returned a promise that never settles
export default test({
	mode: ['client'],
	async test({ assert, target, logs }) {
		await tick();
		const [n, m, shift, show, load] = target.querySelectorAll('button');

		/**
		 * @param {HTMLElement} button
		 * @param {string} content
		 * @param {string[]} expected
		 */
		async function step(button, content, expected) {
			button.click();
			await tick();
			assert.htmlEqual(target.innerHTML, `${buttons}${content}`);
			assert.deepEqual(logs.splice(0), expected);
		}

		assert.htmlEqual(target.innerHTML, `${buttons}<i>0</i><b>0</b>`);
		assert.deepEqual(logs.splice(0), ['load 0,0']);

		// batch A writes `n`
		await step(n, '<i>0</i><b>0</b>', ['aborted 0,0', 'load 1,0']);

		// batch B writes `m`, and the handler reads `p` in the real world, which becomes its global state. Then B's
		// view (which undoes A's `n`) evaluates `p` as a run of its own, which mustn't abort the global run
		await step(m, '<i>0</i><b>0</b>', ['aborted 1,0', 'load 1,1', 'handler object', 'load 0,1']);

		await step(shift, '<i>1</i><b>0</b>', []);
		await step(shift, '<i>1</i><b>1</b>', []);

		// the real world still uses the handler's run
		await step(show, '<i>1</i><b>1</b>', []);
		await step(load, '<i>1</i><b>1</b><p>1,1</p>', []);
	}
});
