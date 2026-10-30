import { tick } from 'svelte';
import { test } from '../../test';

// An item that a committed batch removes, but that a pending batch still selects, is kept offscreen —
// and is updated in the pending batch's view, which waits for it
export default test({
	// batch-views: the item kept offscreen for B stays paused, so B doesn't update it and commits it
	// with stale content (see batch-views.md, "Kept offscreen, but paused")
	skip: true,
	mode: ['client'],
	async test({ assert, target, logs }) {
		await tick();
		const [list_1, list_2, set_c, resolve_3, resolve_6, resolve_10, resolve_2] =
			target.querySelectorAll('button');
		const buttons =
			'<button>list = [3]</button><button>list = [5, 1]</button><button>c = 2</button><button>resolve 3</button><button>resolve 6</button><button>resolve 10</button><button>resolve 2</button>';

		assert.htmlEqual(target.innerHTML, `${buttons}<s>0|0</s><s>1|1</s>`);
		logs.length = 0;

		// batch A
		list_1.click();
		await tick();

		// batch B, which selects the second item that A removes
		list_2.click();
		await tick();
		assert.deepEqual(logs, ['delay 3', 'delay 5']);

		// A commits, the second item is kept offscreen for B
		resolve_3.click();
		await tick();
		assert.htmlEqual(target.innerHTML, `${buttons}<s>3|3</s>`);

		// batch C, which commits while B is pending — the second item needs to update in B's view
		set_c.click();
		await tick();
		resolve_6.click();
		await tick();
		assert.htmlEqual(target.innerHTML, `${buttons}<s>3|6</s>`);
		assert.deepEqual(logs, ['delay 3', 'delay 5', 'delay 6', 'delay 10', 'delay 2']);

		// B waits for the second item
		resolve_10.click();
		await tick();
		assert.htmlEqual(target.innerHTML, `${buttons}<s>3|6</s>`);

		resolve_2.click();
		await tick();
		assert.htmlEqual(target.innerHTML, `${buttons}<s>5|10</s><s>1|2</s>`);
	}
});
