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
		await step(shift, '2/0', []);

		// a fork's run doesn't replace that of the real batch, even though the fork's view includes its writes.
		// (Discarding the fork doesn't abort its run: that only happens with the next run of a real batch; TODO ideally it would at some point)
		await step(inc_a, '2/0', ['aborted 2/0', 'run 3/0']);
		await step(fork, '2/0', ['run 4/0']);
		await step(discard, '2/0', []);
		await step(shift, '3/0', []);

		// a real batch's run doesn't replace the fork's, so committing the fork uses the fork's result. The real
		// batch's run is replaced by its next one, once the fork's commit changes its view
		await step(fork, '3/0', ['run 4/0']);
		await step(inc_b, '3/0', ['aborted 3/0', 'aborted 4/0', 'run 3/1']);
		await step(shift, '3/0', []);
		await step(commit, '4/0', ['aborted 4/0', 'aborted 3/1', 'run 4/1']);
		await step(shift, '4/1', []);

		// destroying the effect aborts the committed run's signal
		await step(toggle, '', ['aborted 4/1']);
	}
});
