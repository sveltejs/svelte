import { tick } from 'svelte';
import { test } from '../../test';

const buttons = `
	<button>a++</button>
	<button>x++</button>
	<button>shift</button>
`;

// A later batch that is merged into an earlier one hands over its run, which replaces the earlier batch's.
// If the earlier batch ran the expression again in the meantime, that run is still in flight (the later
// batch's run didn't supersede it, as it came first), so its signal must abort when it's replaced
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

		// a third batch writes `x` and commits. Only the first batch's run (with `a === 1`) read `x`,
		// so only that batch runs the expression again. Its run is now newer than the second batch's
		await step(inc_x, '0/0', ['run 1/1']);

		// the second batch's run resolves, and the batch is merged into the first one. Its
		// run replaces the first batch's, which is dropped — so that one's signal aborts
		await step(shift, '2/0', ['aborted 1/1']);

		// nothing is left in flight
		await step(shift, '2/0', []);
	}
});
