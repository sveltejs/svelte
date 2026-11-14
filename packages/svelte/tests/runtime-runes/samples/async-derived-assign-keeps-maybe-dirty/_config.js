import { tick } from 'svelte';
import { test } from '../../test';

const buttons =
	'<button>s</button><button>u</button><button>d</button><button>resolve a</button><button>resolve b</button><button>resolve c</button>';

export default test({
	mode: ['client'],
	async test({ assert, target, logs }) {
		await tick();
		const [s, u, d, resolve_a, resolve_b, resolve_c] = target.querySelectorAll('button');

		// batch A: `d` becomes 10, but is not evaluated yet (the `<span>` is deferred)
		s.click();
		await tick();

		// batch B
		u.click();
		await tick();

		// batch C overrides `d` while A and B are pending. This must not mark `d` as
		// clean, because the other batches haven't seen its new value (10) yet
		d.click();
		await tick();

		// B doesn't intersect A or C, so it sees neither of their changes: `s` is 0, and so is `d`.
		// (The value `d` had before C's assignment must not be used: it was computed with A's `s`.)
		// A and C then evaluate the branch B revealed in their own views
		resolve_b.click();
		await tick();
		assert.deepEqual(logs, ['probe 0', 'probe 10', 'probe 99']);
		assert.htmlEqual(target.innerHTML, `${buttons}<p>0</p><p>0</p><span>0</span><i>0</i>`);

		resolve_a.click();
		await tick();
		assert.htmlEqual(target.innerHTML, `${buttons}<p>1</p><p>0</p><span>10</span><i>10</i>`);

		resolve_c.click();
		await tick();
		assert.htmlEqual(target.innerHTML, `${buttons}<p>1</p><p>1</p><span>99</span><i>99</i>`);
	}
});
