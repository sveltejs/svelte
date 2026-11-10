import { tick } from 'svelte';
import { test } from '../../test';

const buttons = `
	<button>fork</button>
	<button>a++</button>
	<button>shift</button>
	<button>load</button>
	<button>commit</button>
`;

// A real batch's run of a derived replaces (and aborts) the global run that a fork's view still matches. The fork
// isn't superseded by the real batch, so it doesn't keep that aborted run: it evaluates the derived again when it
// reads it.
export default test({
	mode: ['client'],
	async test({ assert, target, logs }) {
		await tick();
		const [fork, increment, shift, load, commit] = target.querySelectorAll('button');

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
		assert.deepEqual(logs.splice(0), ['load 0']);

		// the fork shows the branch, which waits before it reads `p`
		await step(fork, '<i>0</i>', []);

		// the real batch's run of `p` replaces the global run that the fork's view (with `a = 0`) matches
		await step(increment, '<i>0</i>', ['aborted 0', 'load 1']);

		// the fork reads `p`, and evaluates it again
		await step(shift, '<i>0</i>', ['load 0']);
		await step(load, '<i>0</i>', []);

		// committing the fork drops its run of `p`, so that one's signal aborts
		await step(commit, '<p>s:p0</p><i>0</i>', ['aborted 0']);

		// the real batch re-runs the branch in its view, which now includes the fork's writes
		await step(shift, '<p>s:p0</p><i>0</i>', []);
		await step(shift, '<p>s:p1</p><i>1</i>', []);
	}
});
