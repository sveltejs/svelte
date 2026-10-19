import { tick } from 'svelte';
import { test } from '../../test';

// A branch that a committed batch hides, but that a pending batch still selects, is kept offscreen —
// and is updated in the pending batch's view, which waits for it
export default test({
	// batch-views: the branch kept offscreen for B stays paused, so B doesn't update it and commits it
	// with stale content (see batch-views.md, "Kept offscreen, but paused")
	skip: true,
	mode: ['client'],
	async test({ assert, target, logs }) {
		await tick();
		const [hide, show, set_c, resolve_3, resolve_5, resolve_2] = target.querySelectorAll('button');
		const buttons =
			'<button>hide</button><button>show</button><button>c = 2</button><button>resolve 3</button><button>resolve 5</button><button>resolve 2</button>';

		assert.htmlEqual(target.innerHTML, `${buttons}<p>0</p><i>1</i>`);
		logs.length = 0;

		// batch A
		hide.click();
		await tick();

		// batch B, which shows the branch that A hides
		show.click();
		await tick();
		assert.deepEqual(logs, ['delay 3', 'delay 5']);

		// A commits, the branch is kept offscreen for B
		resolve_3.click();
		await tick();
		assert.htmlEqual(target.innerHTML, `${buttons}<p>3</p>`);

		// batch C, which commits right away — the branch needs to update in B's view
		set_c.click();
		await tick();
		assert.htmlEqual(target.innerHTML, `${buttons}<p>3</p>`);
		assert.deepEqual(logs, ['delay 3', 'delay 5', 'delay 2']);

		// B waits for the branch
		resolve_5.click();
		await tick();
		assert.htmlEqual(target.innerHTML, `${buttons}<p>3</p>`);

		resolve_2.click();
		await tick();
		assert.htmlEqual(target.innerHTML, `${buttons}<p>5</p><i>2</i>`);
	}
});
