import { tick } from 'svelte';
import { test } from '../../test';

const buttons = `
	<button>read</button>
	<button>y++</button>
	<button>fork</button>
	<button>load</button>
	<button>commit</button>
`;

// A fork's view runs a derived, and the run becomes its global state, because it only read latest values there.
// No other batch could still use the global run it replaces (see `async-abort-signal-fork-global-run`),
// so that run's signal aborts
export default test({
	mode: ['client'],
	async test({ assert, target, logs }) {
		await tick();
		const [read, increment, fork, load, commit] = target.querySelectorAll('button');

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

		// `p` is read outside of a reaction, so nothing runs it again when `y` changes
		await step(read, '', ['load 0']);
		await step(increment, '', []);

		// the fork's run of `p` replaces the global one, which nothing uses anymore
		await step(fork, '', ['load 1', 'aborted 0']);

		await step(load, '', []);
		await step(commit, '<p>p1</p>', []);
	}
});
