import { tick } from 'svelte';
import { test } from '../../test';

const buttons = `<button>a</button><button>b</button><button>shift</button><button>inc</button>`;

// Branches (if block, each item, each fallback) created by a pending batch contain effects
// (render effects and `$effect`s) that are deferred until that batch commits. If an unrelated
// batch selects the same branches and commits first, those effects must run, too
export default test({
	async test({ assert, target, logs }) {
		await tick();
		const [a, b, shift, inc] = target.querySelectorAll('button');

		assert.htmlEqual(target.innerHTML, `${buttons}<p>0</p><span>item 1</span>`);

		// pending batch creates the branches offscreen
		a.click();
		await tick();
		assert.htmlEqual(target.innerHTML, `${buttons}<p>0</p><span>item 1</span>`);
		assert.deepEqual(logs, []);

		// unrelated batch selects the same branches and commits first
		b.click();
		await tick();
		assert.htmlEqual(
			target.innerHTML,
			`${buttons}<p>0</p><span>child 0</span><span>item 1 0</span><span>fallback 0</span>`
		);
		assert.deepEqual(logs, ['effect 0']);

		// TODO ideally the `$effect` wouldn't re-run once the pending batch commits,
		// since nothing it depends on was changed by that batch
		shift.click();
		await tick();
		assert.htmlEqual(
			target.innerHTML,
			`${buttons}<p>1</p><span>child 0</span><span>item 1 0</span><span>fallback 0</span>`
		);
		assert.deepEqual(logs, ['effect 0', 'effect 0']);

		inc.click();
		await tick();
		assert.htmlEqual(
			target.innerHTML,
			`${buttons}<p>1</p><span>child 1</span><span>item 1 1</span><span>fallback 1</span>`
		);
		assert.deepEqual(logs, ['effect 0', 'effect 0', 'effect 1']);
	}
});
