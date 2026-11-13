import { tick } from 'svelte';
import { test } from '../../test';

const buttons = `
	<button>fork</button>
	<button>discard</button>
	<button>shift</button>
`;

// A fork re-runs the only `await` inside a boundary that shows its pending snippet, and its run is the last
// one to resolve. Then nothing is pending anymore: the boundary reveals its content, and the effects it
// deferred run in the real world — they aren't handed to the fork, which is discarded
export default test({
	mode: ['client'],
	async test({ assert, target, logs }) {
		const [fork, discard, shift] = target.querySelectorAll('button');
		await tick();
		assert.htmlEqual(target.innerHTML, `${buttons} <p>pending</p>`);

		fork.click();
		await tick();

		// the real world's run
		shift.click();
		await tick();
		await tick();
		assert.htmlEqual(target.innerHTML, `${buttons} <p>pending</p>`);
		assert.deepEqual(logs, []);

		// the fork's run
		shift.click();
		await tick();
		await tick();
		assert.htmlEqual(target.innerHTML, `${buttons} <p>0</p>`);
		assert.deepEqual(logs, ['effect ran']);

		discard.click();
		await tick();
		assert.htmlEqual(target.innerHTML, `${buttons} <p>0</p>`);
		assert.deepEqual(logs, ['effect ran']);
	}
});
