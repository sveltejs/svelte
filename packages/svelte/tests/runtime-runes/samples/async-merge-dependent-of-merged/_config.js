import { tick } from 'svelte';
import { test } from '../../test';

const buttons = `
	<button>A0</button>
	<button>A</button>
	<button>B</button>
	<button>resolve q</button>
	<button>resolve p</button>
	<button>resolve t</button>
	<button>resolve r</button>
	<button>init</button>
`;

// Test ensure dependencies on earlier batches are also merged correctly
export default test({
	async test({ assert, target }) {
		const [A0, A, B, resolve_q, resolve_p, resolve_t, resolve_r, init] =
			target.querySelectorAll('button');

		init.click();
		await tick();
		assert.htmlEqual(target.innerHTML, `${buttons}<p>q0 r0 p0 t0 s0</p>`);

		A0.click(); // q=1, r=1 -> slow(q=1), slow(r=1)
		await tick();
		A.click(); // q=2, p=1, s=1 -> slow(q=2), slow(p=1); depends on A0
		await tick();
		B.click(); // s=2, t=1 -> slow(t=1); depends on A
		await tick();
		assert.htmlEqual(target.innerHTML, `${buttons}<p>q0 r0 p0 t0 s0</p>`);

		// A's runs resolve -> A merges into A0, which is still waiting on slow(r=1)
		resolve_q.click();
		resolve_p.click();
		await tick();
		assert.htmlEqual(target.innerHTML, `${buttons}<p>q0 r0 p0 t0 s0</p>`);

		// B's run resolves -> B must wait for A0
		resolve_t.click();
		await tick();
		assert.htmlEqual(target.innerHTML, `${buttons}<p>q0 r0 p0 t0 s0</p>`);

		// A0's run resolves -> everything commits at once
		resolve_r.click();
		await tick();
		assert.htmlEqual(target.innerHTML, `${buttons}<p>q2 r1 p1 t1 s2</p>`);
	}
});
