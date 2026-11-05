import { tick } from 'svelte';
import { test } from '../../test';

const buttons = `
	<button>toggle</button>
	<button>fork</button>
	<button>discard</button>
	<button>shift</button>
`;

// A fork re-runs an expression with an `await` inside, and is discarded while its run is in flight. Then hiding
// the branch doesn't take effect, and neither does showing it again afterwards (its content isn't created again).
// Without the `await` inside the expression, it works.
export default test({
	// TODO see above
	skip: true,
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
		discard.click();
		await tick();
		assert.deepEqual(logs.splice(0), ['load 1']);

		toggle.click();
		await tick();
		assert.htmlEqual(target.innerHTML, buttons);

		toggle.click();
		await tick();
		shift.click();
		await tick();
		shift.click();
		await tick();
		assert.htmlEqual(target.innerHTML, `${buttons}<p>0</p>`);
	}
});
