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

		// the two batches share the awaited `a + b` expression, so they were
		// merged into one, superseding the first in-flight run. Resolving the
		// re-run ('bb', which pop reaches first) commits the combined state,
		// including the `c` write from the $effect during the flush phase
		pop.click();
		await tick();
		assert.htmlEqual(target.innerHTML, `${buttons} <p>b</p><p>b</p><p>bb</p><p>2</p>`);

		// stale promises from the superseded runs — resolving them does nothing
		shift.click();
		await tick();
		assert.htmlEqual(target.innerHTML, `${buttons} <p>b</p><p>b</p><p>bb</p><p>2</p>`);

		shift.click();
		await tick();
		assert.htmlEqual(target.innerHTML, `${buttons} <p>b</p><p>b</p><p>bb</p><p>2</p>`);
	}
});
