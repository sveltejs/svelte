import { tick } from 'svelte';
import { test } from '../../test';

const buttons =
	'<button>s</button><button>u</button><button>d</button><button>resolve a</button><button>resolve b</button><button>resolve c</button>';

// Like `async-derived-assign-pending-dependency`, but the derived reads the written source through another
// derived. That one is only evaluated after the assignment (lazily, and again in other views), so it gets
// a newer version than the assignment, but what it read was written before — the assignment still holds
export default test({
	mode: ['client'],
	async test({ assert, target, logs }) {
		await tick();
		const [s, u, d, resolve_a, resolve_b, resolve_c] = target.querySelectorAll('button');

		// batch A: `s` becomes 1 (and `d` 10)
		s.click();
		await tick();

		// batch B
		u.click();
		await tick();

		// batch C assigns to `d` while A is pending, i.e. on top of A's `s`
		d.click();
		await tick();
		assert.htmlEqual(target.innerHTML, `${buttons}<p>0</p><p>0</p><span>0</span>`);

		// C commits on its own: in its view, A's `s` is undone, but the assignment holds
		resolve_c.click();
		await tick();
		assert.htmlEqual(target.innerHTML, `${buttons}<p>0</p><p>1</p><span>99</span>`);

		// B commits on its own: the committed assignment holds in its view, too
		resolve_b.click();
		await tick();
		assert.deepEqual(logs, ['probe 99']);
		assert.htmlEqual(target.innerHTML, `${buttons}<p>0</p><p>1</p><span>99</span><i>99</i>`);

		// A commits: `s` changed before the assignment, so it still holds
		resolve_a.click();
		await tick();
		assert.deepEqual(logs, ['probe 99']);
		assert.htmlEqual(target.innerHTML, `${buttons}<p>1</p><p>1</p><span>99</span><i>99</i>`);
	}
});
