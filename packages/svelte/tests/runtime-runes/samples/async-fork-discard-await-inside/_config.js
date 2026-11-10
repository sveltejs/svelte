import { tick } from 'svelte';
import { test } from '../../test';

const buttons = `
	<button>toggle</button>
	<button>fork</button>
	<button>discard</button>
	<button>shift</button>
`;

// A fork re-runs an expression with an `await` inside, and is discarded while its run is in flight. Hiding the
// branch afterwards still takes effect, and so does showing it again (its content is created again)
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
