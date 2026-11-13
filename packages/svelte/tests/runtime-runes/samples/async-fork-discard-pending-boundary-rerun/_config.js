import { tick } from 'svelte';
import { test } from '../../test';

const buttons = `
	<button>fork</button>
	<button>discard</button>
	<button>shift</button>
`;

// A fork re-runs the only `await` inside a boundary that shows its pending snippet. The real world's run
// resolves first, but the boundary waits for the fork's run, too (see `async-fork-pending-boundary-run`).
// Once the fork is discarded, nothing is pending anymore, and the boundary reveals its content
export default test({
	skip: true,
	mode: ['client'],
	async test({ assert, target }) {
		const [fork, discard, shift] = target.querySelectorAll('button');
		await tick();
		assert.htmlEqual(target.innerHTML, `${buttons} <p>pending</p>`);

		fork.click();
		await tick();
		shift.click();
		await tick();
		await tick();
		assert.htmlEqual(target.innerHTML, `${buttons} <p>pending</p>`);

		discard.click();
		await tick();
		await tick();
		assert.htmlEqual(target.innerHTML, `${buttons} <p>0</p>`);
	}
});
