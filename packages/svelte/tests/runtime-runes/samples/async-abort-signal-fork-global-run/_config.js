import { tick } from 'svelte';
import { test } from '../../test';

const buttons = `
	<button>show</button>
	<button>y++</button>
	<button>fork</button>
	<button>load</button>
	<button>shift</button>
	<button>discard</button>
`;

// A fork's view runs a derived, and the run becomes its global state, because it only read latest values there.
// It replaces the global run, which a pending batch is still waiting for. A fork doesn't supersede the runs of
// real batches, so that run's signal mustn't abort: the promise the batch awaits would never settle, and the
// batch would be stuck until something else makes it run again. Instead, the other batches keep the replaced run
// along with its signal, which aborts once none of them holds it anymore
export default test({
	mode: ['client'],
	async test({ assert, target, logs }) {
		await tick();
		const [show, increment, fork, load, shift, discard] = target.querySelectorAll('button');

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

		assert.htmlEqual(target.innerHTML, `${buttons}<i>0</i>`);
		assert.deepEqual(logs.splice(0), []);

		// batch X shows the branch, which evaluates `p` (its global run) and waits for it
		await step(show, '<i>0</i>', ['load 0']);

		// batch Y writes `y`. Nothing in its view reads `p`, so the global run stays, outdated in the real world
		await step(increment, '<i>0</i>', []);

		// the fork's view includes Y's writes, so its branch evaluates `p` again. That run only read latest
		// values, so it's the global run now — but it doesn't abort the one X is waiting for
		await step(fork, '<i>0</i>', ['load 1']);

		// the run X is waiting for resolves. X kept it when the fork's run replaced it (its view
		// undoes Y's write), so it doesn't evaluate `p` again, and commits while Y is still pending
		await step(load, '<p>p0</p><i>0</i>', []);

		// the fork's run of `p` is the global one, so discarding the fork doesn't abort it, and Y uses it
		await step(discard, '<p>p0</p><i>0</i>', []);
		await step(shift, '<p>p0</p><i>0</i>', []);

		// Y was the last batch to hold the replaced run, so its signal aborts when Y commits
		await step(load, '<p>p1</p><i>1</i>', ['aborted 0']);
	}
});
