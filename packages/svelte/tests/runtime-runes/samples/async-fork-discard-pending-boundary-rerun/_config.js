import { tick } from 'svelte';
import { test } from '../../test';

const buttons = `
	<button>fork</button>
	<button>discard</button>
	<button>shift</button>
`;

// A fork re-runs the only `await` inside a pending boundary. The real world's run reveals the boundary
// without waiting for the fork's run, which is then discarded.
export default test({
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
		assert.htmlEqual(target.innerHTML, `${buttons} <p>0</p>`);

		discard.click();
		await tick();
		await tick();
		assert.htmlEqual(target.innerHTML, `${buttons} <p>0</p>`);
	}
});
