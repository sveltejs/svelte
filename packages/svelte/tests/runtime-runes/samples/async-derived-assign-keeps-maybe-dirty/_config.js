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

		// B sees A's change (but not C's), so `d` is 10 in its world
		resolve_b.click();
		await tick();
		assert.equal(logs[0], 'probe 10');

		resolve_a.click();
		await tick();
		assert.htmlEqual(target.innerHTML, `${buttons}<p>1</p><p>0</p><span>10</span><i>10</i>`);

		resolve_c.click();
		await tick();
		assert.htmlEqual(target.innerHTML, `${buttons}<p>1</p><p>1</p><span>99</span><i>99</i>`);
	}
});
