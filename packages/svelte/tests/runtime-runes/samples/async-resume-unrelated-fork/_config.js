import { tick } from 'svelte';
import { test } from '../../test';

const buttons = `
	<button>a</button>
	<button>fork</button>
	<button>shift</button>
	<button>commit</button>
	<button>discard</button>
	<button>reset</button>
`;

// Like `async-resume-unrelated-batch`, with a fork that reveals the branch that the pending batch A created.
// The fork runs the expression in its own view, which undoes A's `x = 1`. A's result is there first: A creates
// the content, and commits on its own. The fork, whose view then has A's `x`, runs the expression again:
// committed (before or after A's result), it commits once that's done; discarded, it leaves A alone
export default test({
	mode: ['client'],
	async test({ assert, target, logs }) {
		const [a, fork, shift, commit, discard, reset] = target.querySelectorAll('button');

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

		for (const mode of ['commit', 'commit after', 'discard']) {
			try {
				await step(a, '<span>false</span>', ['push 1']);
				await step(fork, '<span>false</span>', ['push 0']);

				if (mode === 'commit') {
					await step(commit, '<span>false</span>', []);
				} else if (mode === 'discard') {
					await step(discard, '<span>false</span>', []);
				}

				// A's result: A creates the content and commits (the fork runs the expression again with A's `x`)
				await step(shift, '<span>false</span><p>1 1</p>', mode === 'discard' ? [] : ['push 1']);

				if (mode === 'commit after') {
					await step(commit, '<span>false</span><p>1 1</p>', []);
				}

				// the fork's runs: the one without A's `x` is obsolete, the other one is the fork's result
				// (a discarded fork only has the first one, and it's obsolete, too)
				await step(shift, '<span>false</span><p>1 1</p>', []);
				await step(shift, `<span>${mode !== 'discard'}</span><p>1 1</p>`, []);

				await step(reset, '<span>false</span>', []);
			} catch (e) {
				/** @type {Error} */ (e).message = `${mode}: ${/** @type {Error} */ (e).message}`;
				throw e;
			}
		}
	}
});
