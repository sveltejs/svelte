import { tick } from 'svelte';
import { test } from '../../test';

const buttons = `
	<button>fork</button>
	<button>discard</button>
	<button>shift</button>
`;

// A fork hides the branch that contains the only pending `await` inside a boundary that shows its pending
// snippet. The fork's view has nothing pending anymore, but the real world does: the boundary keeps showing
// its pending snippet until the fork is committed (or the `await` resolves), and the effects it deferred
// aren't handed to the fork, which is discarded
export default test({
	mode: ['client'],
	async test({ assert, target, logs }) {
		const [fork, discard, shift] = target.querySelectorAll('button');
		await tick();
		assert.htmlEqual(target.innerHTML, `${buttons} <p>pending</p>`);

		fork.click();
		await tick();
		assert.htmlEqual(target.innerHTML, `${buttons} <p>pending</p>`);

		discard.click();
		await tick();
		assert.htmlEqual(target.innerHTML, `${buttons} <p>pending</p>`);
		assert.deepEqual(logs, []);

		shift.click();
		await tick();
		await tick();
		assert.htmlEqual(target.innerHTML, `${buttons} <p>sibling</p> <p>slow</p>`);
		assert.deepEqual(logs, ['effect ran']);
	}
});
