import { tick } from 'svelte';
import { test } from '../../test';

const buttons = `
	<button>up</button>
	<button>down</button>
	<button>show1</button>
	<button>show2</button>
	<button>shift a</button>
	<button>shift t</button>
`;

export default test({
	async test({ assert, target }) {
		await tick();

		const [up, , show1, show2, shift_a, shift_t] = target.querySelectorAll('button');

		show1.click();
		await tick();
		assert.htmlEqual(target.innerHTML, `${buttons} <p>loading 1...</p>`);

		show2.click();
		await tick();
		assert.htmlEqual(target.innerHTML, `${buttons} <p>loading 1...</p> <p>loading 2...</p>`);

		// batch A: writes a=1; async-a effect re-runs and is pending
		up.click();
		await tick();

		// B's continuation first-reads `a` through the pending batch's pre-write overlay. This
		// causes a rerun of the async effect inside A.
		shift_t.click();
		await tick();
		assert.htmlEqual(target.innerHTML, `${buttons} <p>loading 1...</p> <p>loading 2...</p>`);

		// resolve the pending batch's async-a runs -> it commits a=1.
		shift_a.click();
		await tick();
		shift_a.click();
		await tick();
		assert.htmlEqual(target.innerHTML, `${buttons} <p>loading 1...</p> <p>async a: 1</p>`);

		// finish triggered rerun
		shift_t.click();
		await tick();
		assert.htmlEqual(target.innerHTML, `${buttons} <p>late read: 1</p> <p>async a: 1</p>`);
	}
});
