import { tick } from 'svelte';
import { test } from '../../test';

const buttons = '<button>a</button> <button>b</button> <button>shift</button> <button>pop</button>';

export default test({
	async test({ assert, target }) {
		await tick();

		const [a, b, , pop] = target.querySelectorAll('button');
		const shift = target.querySelectorAll('button')[2];

		assert.htmlEqual(target.innerHTML, `${buttons} <p>a</p><p>a</p><p>aa</p><p>1</p>`);

		// start two independent batches, both blocked on their awaited expression
		a.click();
		await tick();
		assert.htmlEqual(target.innerHTML, `${buttons} <p>a</p><p>a</p><p>aa</p><p>1</p>`);

		b.click();
		await tick();
		assert.htmlEqual(target.innerHTML, `${buttons} <p>a</p><p>a</p><p>aa</p><p>1</p>`);

		// resolve the newer (b) batch first. Committing it must not commit the
		// still-pending `a` batch, whose async work has not completed — `a` must
		// still read 'a', and the unrelated `c` update must not be blocked
		pop.click();
		await tick();
		assert.htmlEqual(target.innerHTML, `${buttons} <p>a</p><p>b</p><p>ab</p><p>2</p>`);

		// stale promise from the `a` batch's first run — resolving it does nothing
		shift.click();
		await tick();
		assert.htmlEqual(target.innerHTML, `${buttons} <p>a</p><p>b</p><p>ab</p><p>2</p>`);

		// the `a` batch's re-run await ('bb') resolves — everything is committed
		shift.click();
		await tick();
		assert.htmlEqual(target.innerHTML, `${buttons} <p>b</p><p>b</p><p>bb</p><p>2</p>`);
	}
});
