import { tick } from 'svelte';
import { test } from '../../test';

const buttons =
	'<button>x</button><button>s</button><button>resolve a</button><button>resolve b</button>';

export default test({
	mode: ['client'],
	async test({ assert, target }) {
		await tick();
		const [x, s, resolve_a, resolve_b] = target.querySelectorAll('button');
		assert.htmlEqual(target.innerHTML, `${buttons}<p>0:5</p><p>5</p>`);

		// batch A: `t` becomes truthy (pending)
		x.click();
		await tick();

		// batch B: `d` becomes 0 (pending)
		s.click();
		await tick();
		assert.htmlEqual(target.innerHTML, `${buttons}<p>0:5</p><p>5</p>`);

		// In A's world, `d` is recomputed to 0. That's the real value, but not the value
		// A sees for it (the one from before B's change), so A has to record it
		resolve_a.click();
		await tick();
		assert.htmlEqual(target.innerHTML, `${buttons}<p>1:0</p><p>5</p>`);

		resolve_b.click();
		await tick();
		assert.htmlEqual(target.innerHTML, `${buttons}<p>1:0</p><p>0</p>`);
	}
});
