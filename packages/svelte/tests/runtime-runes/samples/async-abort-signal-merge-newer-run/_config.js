import { tick } from 'svelte';
import { test } from '../../test';

const buttons = `
	<button>a++</button>
	<button>x++</button>
	<button>shift</button>
`;

// A later batch that aborts an earlier run merges into its batch before resolving.
// The abandoned run no longer keeps a separate view in which its dependencies can restart it.
export default test({
	mode: ['client'],
	async test({ assert, target, logs }) {
		await tick();
		const [inc_a, inc_x, shift] = target.querySelectorAll('button');

		/**
		 * @param {HTMLElement} button
		 * @param {string} p
		 * @param {string[]} expected
		 */
		async function step(button, p, expected) {
			button.click();
			await tick();
			assert.htmlEqual(target.innerHTML, `${buttons}<p>${p}</p>`);
			assert.deepEqual(logs.splice(0), expected);
		}

		assert.htmlEqual(target.innerHTML, `${buttons}<p>0/0</p>`);
		assert.deepEqual(logs.splice(0), ['run 0/0']);

		// two batches write `a`. The later one's run supersedes the earlier one's
		await step(inc_a, '0/0', ['aborted 0/0', 'run 1/0']);
		await step(inc_a, '0/0', ['aborted 1/0', 'run 2/0']);

		// A third batch writes `x` and commits. The run with `a === 1` was already replaced,
		// so its dependency on `x` must not restart it.
		await step(inc_x, '0/0', []);

		// The replacement run resolves in the already-merged batch.
		await step(shift, '2/0', []);

		// nothing is left in flight
		await step(shift, '2/0', []);
	}
});
