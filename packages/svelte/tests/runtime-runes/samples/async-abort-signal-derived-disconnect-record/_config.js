import { tick } from 'svelte';
import { test } from '../../test';

const buttons = `
	<button>fork</button>
	<button>toggle</button>
	<button>load</button>
	<button>commit</button>
`;

// A derived that loses all its reactions aborts its signals — also those of the runs batches hold of it as records.
// Like its global run, such a record must not be used again: here, the fork's view reads the derived again after
// it was disconnected. Before, it reused its record, whose promise was rejected when its signal aborted, and which
// never settled — so the fork committed its write, but not the content that awaited the derived
export default test({
	mode: ['client'],
	async test({ assert, target, logs }) {
		await tick();
		const [fork, toggle, load, commit] = target.querySelectorAll('button');

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

		assert.htmlEqual(target.innerHTML, `${buttons}<p>0</p>`);
		assert.deepEqual(logs.splice(0), ['load 0']);

		// the fork's view evaluates `p` as a run of its own
		await step(fork, '<p>0</p>', ['load 1']);

		// hiding the content disconnects `p`, which aborts every run of it
		await step(toggle, '', ['aborted 1']);

		// showing it again re-runs `p` in the real world, and in the fork's view (which is rebased)
		await step(toggle, '<p>0</p>', ['load 0', 'load 1']);

		await step(load, '<p>0</p>', []);
		await step(commit, '<p>1</p>', []);
	}
});
