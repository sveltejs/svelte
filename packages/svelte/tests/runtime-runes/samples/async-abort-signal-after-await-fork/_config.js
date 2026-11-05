import { tick } from 'svelte';
import { test } from '../../test';

const buttons = `
	<button>toggle</button>
	<button>fork</button>
	<button>discard</button>
	<button>shift</button>
`;

// Test that different worlds don't interfere with respects to their abort signals (variant where there's chained awaits, and a fork)
export default test({
	mode: ['client'],
	async test({ assert, target, logs }) {
		const [toggle, fork, discard, shift] = target.querySelectorAll('button');

		toggle.click();
		await tick();
		shift.click();
		await tick();
		assert.htmlEqual(target.innerHTML, `${buttons}<p>0</p>`);
		assert.deepEqual(logs.splice(0), ['load 0']);

		fork.click();
		await tick();
		assert.deepEqual(logs.splice(0), ['load 1']);

		discard.click();
		await tick();
		assert.htmlEqual(target.innerHTML, `${buttons}<p>0</p>`);
		assert.deepEqual(logs.splice(0), []);

		// (the discarded fork's run is resolved first, see `async-fork-discard-await-inside`)
		shift.click();
		await tick();

		toggle.click();
		await tick();
		assert.htmlEqual(target.innerHTML, buttons);
		assert.deepEqual(logs.splice(0), ['aborted 0', 'aborted 1']);
	}
});
