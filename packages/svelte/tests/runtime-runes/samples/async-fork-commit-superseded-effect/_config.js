import { tick } from 'svelte';
import { test } from '../../test';

const buttons =
	'<button>fork</button><button>y</button><button>shift</button><button>commit</button>';

export default test({
	async test({ assert, target }) {
		await tick();
		const [forkButton, y, shift, commit] = target.querySelectorAll('button');

		assert.htmlEqual(target.innerHTML, `<p>0</p>${buttons}`);

		// speculative world: x becomes 1, async expression runs with x + y = 1
		forkButton.click();
		await tick();
		assert.htmlEqual(target.innerHTML, `<p>0</p>${buttons}`);

		// real world: y becomes 1, async expression runs with x + y = 1
		// (computed with the pre-fork x = 0) — this run supersedes the
		// fork's validation of the effect
		y.click();
		await tick();
		assert.htmlEqual(target.innerHTML, `<p>0</p>${buttons}`);

		// commit the fork while the real batch is still pending — x = 1 is
		// written, and the async expression must eventually re-run with the
		// committed value, because its in-flight run used x = 0
		commit.click();
		await tick();
		assert.htmlEqual(target.innerHTML, `<p>0</p>${buttons}`);

		// resolve all in-flight runs (superseded ones are no-ops)
		for (let i = 0; i < 4; i += 1) {
			shift.click();
			await tick();
		}

		// x = 1, y = 1 — anything else means the effect resolved with a value
		// computed from stale inputs and was never re-run
		assert.htmlEqual(target.innerHTML, `<p>2</p>${buttons}`);
	}
});
