import { tick } from 'svelte';
import { test } from '../../test';

const buttons = `
	<button>x++</button>
	<button>a++</button>
	<button>resolve x</button>
	<button>shift</button>
`;

// A later batch that is merged into an earlier one hands over its run, which replaces the earlier batch's.
// If the earlier batch ran the expression again in the meantime, that run is still in flight (the later
// batch's run didn't supersede it, as it came first), so its signal must abort when it's replaced.
// (The write that makes the earlier batch run it again comes from a batch before both: a later batch would reach
// the expression through the earlier batch's run, intersect with both batches, and be merged instead of committing)
export default test({
	mode: ['client'],
	async test({ assert, target, logs }) {
		await tick();
		const [inc_x, inc_a, resolve_x, shift] = target.querySelectorAll('button');

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

		assert.htmlEqual(target.innerHTML, `${buttons}<i>0</i><p>0/0</p>`);
		assert.deepEqual(logs.splice(0), ['run 0/0']);

		// a first batch writes `x`, and stays pending on work of its own. The expression doesn't read `x` yet,
		// so the batch doesn't run it (and doesn't intersect with the batches below)
		await step(inc_x, '<i>0</i><p>0/0</p>', []);

		// two batches write `a`. The later one's run supersedes the earlier one's. Both views undo
		// the first batch's `x`, and only the run with `a === 1` reads it
		await step(inc_a, '<i>0</i><p>0/0</p>', ['aborted 0/0', 'run 1/0']);
		await step(inc_a, '<i>0</i><p>0/0</p>', ['aborted 1/0', 'run 2/0']);

		// the first batch commits, which rebases the others. Only the `a === 1` batch's run read `x`,
		// so only that batch runs the expression again. Its run is now newer than the `a === 2` batch's
		await step(resolve_x, '<i>x</i><p>0/0</p>', ['run 1/1']);

		// the `a === 2` batch's run resolves, and the batch is merged into the `a === 1` one. Its
		// run replaces that batch's, which is dropped — so that one's signal aborts
		await step(shift, '<i>x</i><p>2/0</p>', ['aborted 1/1']);

		// nothing is left in flight
		await step(shift, '<i>x</i><p>2/0</p>', []);
	}
});
