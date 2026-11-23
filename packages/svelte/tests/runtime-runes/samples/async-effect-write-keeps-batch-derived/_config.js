import { tick } from 'svelte';
import { test } from '../../test';

const buttons = '<button>x</button><button>t</button><button>shift</button>';

// While batch A (x) commits, a pre effect writes to `s`. That marks `label` (via `big`) as
// maybe dirty, but it doesn't actually change. `label` must still show the value from A's
// point of view, not the one from the later, still-pending batch B (t).
export default test({
	async test({ assert, target }) {
		await tick();
		const [x, t, shift] = target.querySelectorAll('button');

		// A
		x.click();
		await tick();

		// B
		t.click();
		await tick();
		assert.htmlEqual(target.innerHTML, `${buttons}<p>0</p><p>0</p><p>0 false-0</p>`);

		// A commits, B is still pending
		shift.click();
		await tick();
		assert.htmlEqual(target.innerHTML, `${buttons}<p>1</p><p>0</p><p>1 false-0</p>`);

		// B commits
		shift.click();
		await tick();
		assert.htmlEqual(target.innerHTML, `${buttons}<p>1</p><p>1</p><p>1 false-1</p>`);
	}
});
