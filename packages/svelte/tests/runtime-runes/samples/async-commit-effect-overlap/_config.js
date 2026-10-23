import { tick } from 'svelte';
import { test } from '../../test';

const buttons = '<button>a</button> <button>b</button> <button>shift</button> <button>pop</button>';

export default test({
	async test({ assert, target }) {
		await tick();

		const [a, b, , pop] = target.querySelectorAll('button');
		const shift = target.querySelectorAll('button')[2];

		assert.htmlEqual(target.innerHTML, `${buttons} <p>a</p><p>a</p><p>aa</p><p>1</p>`);

		// start two batches, both blocked on their awaited expression
		a.click();
		await tick();
		assert.htmlEqual(target.innerHTML, `${buttons} <p>a</p><p>a</p><p>aa</p><p>1</p>`);

		// the `b` batch re-runs the expression that the `a` batch ran, so it intersects with it: its
		// view includes `a = 'b'`
		b.click();
		await tick();
		assert.htmlEqual(target.innerHTML, `${buttons} <p>a</p><p>a</p><p>aa</p><p>1</p>`);

		// resolve the newer (b) batch first. It merges into the `a` batch, whose run of the expression
		// it supersedes, so both commit — and the `c` update, which runs in the commit, isn't blocked
		pop.click();
		await tick();
		assert.htmlEqual(target.innerHTML, `${buttons} <p>b</p><p>b</p><p>bb</p><p>2</p>`);

		// stale promise from the `a` batch's run — resolving it does nothing
		shift.click();
		await tick();
		assert.htmlEqual(target.innerHTML, `${buttons} <p>b</p><p>b</p><p>bb</p><p>2</p>`);
	}
});
