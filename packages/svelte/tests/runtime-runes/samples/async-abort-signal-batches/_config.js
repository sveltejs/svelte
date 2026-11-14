import { tick } from 'svelte';
import { test } from '../../test';

const buttons = `
	<button>a++</button>
	<button>b++</button>
	<button>fork</button>
	<button>commit</button>
	<button>discard</button>
	<button>shift</button>
	<button>toggle</button>
`;

// Test that different worlds don't interfere with respects to their abort signals
export default test({
	mode: ['client'],
	async test({ assert, target, logs }) {
		const [inc_a, inc_b, fork, commit, discard, shift, toggle] = target.querySelectorAll('button');

		/**
		 * @param {HTMLElement} button
		 * @param {string} p
		 * @param {string[]} expected
		 */
		async function step(button, p, expected) {
			button.click();
			await tick();
			assert.htmlEqual(target.innerHTML, `${buttons}${p && `<p>${p}</p>`}`);
			assert.deepEqual(logs.splice(0), expected);
		}

		await step(toggle, '', ['run 0/0']);
		await step(shift, '0/0', []);

		// a++ twice: the second batch writes `a`, too, so it's merged with the first one, and its run replaces
		// the first one's (which in turn replaced the committed one)
		await step(inc_a, '0/0', ['aborted 0/0', 'run 1/0']);
		await step(inc_a, '0/0', ['aborted 1/0', 'run 2/0']);

		// the later batch is merged into the earlier one, and its run moves along with its signal. That run is the
		// committed one now: it's the global run, so nothing aborts it yet...
		await step(shift, '2/0', []);

		// ...until the next run replaces it
		await step(inc_a, '2/0', ['aborted 2/0', 'run 3/0']);

		// a fork's run doesn't replace that of the real batch, even though the fork's view includes its writes
		await step(inc_a, '2/0', ['aborted 3/0', 'run 4/0']);
		await step(fork, '2/0', ['run 5/0']);

		// discarding the fork aborts the run in its view right away
		await step(discard, '2/0', ['aborted 5/0']);

		// (again, the merged batch's run is the committed one now, and keeps its signal)
		await step(shift, '4/0', []);

		// a real batch's run doesn't replace the fork's, so committing the fork uses the fork's result. The real
		// batch's run is replaced by its next one, once the fork's commit changes its view. (The fork's run doesn't
		// replace the committed one, but the real batch's does)
		await step(fork, '4/0', ['run 5/0']);
		await step(inc_b, '4/0', ['aborted 4/0', 'run 4/1']);
		await step(shift, '4/0', []);
		await step(commit, '5/0', ['aborted 4/1', 'aborted 5/0', 'run 5/1']);
		await step(shift, '5/1', []);

		// destroying the effect aborts the committed run's signal
		await step(toggle, '', ['aborted 5/1']);
	}
});
