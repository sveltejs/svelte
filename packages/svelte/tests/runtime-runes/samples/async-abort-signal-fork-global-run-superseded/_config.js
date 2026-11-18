import { tick } from 'svelte';
import { test } from '../../test';

const buttons = `
	<button>read</button>
	<button>y++</button>
	<button>fork show</button>
	<button>fork preview</button>
	<button>other</button>
	<button>load</button>
	<button>commit</button>
	<button>shift</button>
`;

// A global run that a fork's run replaced is kept by the other batches, along with its signal (see
// `async-abort-signal-fork-global-run`). When a real batch runs the derived again, its run supersedes that
// of the earlier batches — but the signal only aborts once no other batch holds the run anymore
export default test({
	mode: ['client'],
	async test({ assert, target, logs }) {
		await tick();
		const [read, increment, fork_show, fork_preview, other, load, commit, shift] =
			target.querySelectorAll('button');

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

		// `p` is read outside of a reaction (its global run), so nothing runs it again when batch Y writes `y`
		await step(read, '<i>0</i>', ['load 0']);
		await step(increment, '<i>0</i>', []);

		// the first fork's view undoes Y's write, so its branch waits for the global run of `p`
		await step(fork_show, '<i>0</i>', []);

		// the second fork's view includes Y's writes, so its branch evaluates `p` again. That run is
		// the global one now, and Y and the first fork keep the run it replaced
		await step(fork_preview, '<i>0</i>', ['load 1']);

		// batch B writes `y`, too, and evaluates `p` again. Its run supersedes the one Y holds (and replaces
		// the global one, which only the second fork uses) — but the first fork holds that one, too, and
		// is still waiting for it, so its signal doesn't abort
		await step(other, '<i>0</i>', ['aborted 1', 'load 2']);

		// ...and the first fork can be committed with its result. Its branch now exists in Y's view, too,
		// where `p` is evaluated again. That run replaces the kept one, which no other batch holds anymore
		await step(load, '<i>0</i>', []);
		await step(commit, '<p>p0</p><i>0</i>', ['aborted 0', 'load 1']);

		// Y and B are done. (B's run of `p` is the one that applies, and Y's is dropped)
		await step(shift, '<p>p0</p><i>0</i>', []);
		await step(shift, '<p>p0</p><i>0</i>', []);
		await step(load, '<p>p2</p><u>p2</u><i>2</i>', ['aborted 1']);
	}
});
