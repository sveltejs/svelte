import { tick } from 'svelte';
import { test } from '../../test';

// An async derived that's created while a reaction runs (here: `$derived(await ...)` in an async function that
// a derived calls) doesn't suspend (`should_suspend` in `async_derived`), so the batch whose write re-runs it
// commits without waiting for its result. The result is then written in that batch, which has committed
// already (and is unlinked), so the update never shows. (The same on `main`)
export default test({
	// TODO see above
	skip: true,
	mode: ['client'],
	async test({ assert, target, logs }) {
		await tick();
		const [x, shift] = target.querySelectorAll('button');
		assert.htmlEqual(target.innerHTML, '<button>x</button><button>shift</button><p>0 0</p>');
		assert.deepEqual(logs.splice(0), ['load 0']);

		x.click();
		await tick();
		assert.deepEqual(logs.splice(0), ['load 1']);

		shift.click();
		await tick();
		assert.htmlEqual(target.innerHTML, '<button>x</button><button>shift</button><p>1 1</p>');
	}
});
