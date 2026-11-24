import { tick } from 'svelte';
import { test } from '../../test';

const buttons = `
	<button>x++</button>
	<button>y++</button>
	<button>z++</button>
	<button>load</button>
`;

// Batch B evaluates `d` in its view, which only reads latest values there (another batch, A, is pending), so the
// run becomes its global state. A later batch C, whose view undoes B's write, evaluates `d` as a run of its own.
// That run supersedes B's runs, but the global run isn't one of them. Before, the global run's signal was keyed
// by B, so C's run aborted the promise B awaits, which never settles, and B never committed
export default test({
	mode: ['client'],
	async test({ assert, target, logs }) {
		await tick();
		const [x, y, z, load] = target.querySelectorAll('button');

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

		assert.htmlEqual(target.innerHTML, `${buttons}<p>0</p><i>0</i><b>0</b>`);
		assert.deepEqual(logs.splice(0), ['load 0']);

		await step(x, '<p>0</p><i>0</i><b>0</b>', []);
		await step(y, '<p>0</p><i>0</i><b>0</b>', ['load 1']);
		await step(z, '<p>0</p><i>0</i><b>0</b>', ['load 0']);

		// B's run of `d` resolves, and B commits
		await step(load, '<p>1</p><i>0</i><b>0</b>', []);
	}
});
