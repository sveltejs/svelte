import { tick } from 'svelte';
import { test } from '../../test';

export default test({
	async test({ assert, target }) {
		await tick();
		const [button1, button2, pop, shift] = target.querySelectorAll('button');
		const [p] = target.querySelectorAll('p');

		button1.click();
		await tick();
		button2.click();
		await tick();
		assert.htmlEqual(p.innerHTML, `0 + 0 = 0 | 0 0`);

		shift.click();
		await tick();
		assert.htmlEqual(p.innerHTML, `0 + 0 = 0 | 0 0`);

		pop.click();
		await tick();
		assert.htmlEqual(p.innerHTML, `0 + 0 = 0 | 0 0`);

		// the two batches share the awaited `a + b` expression, so they were
		// merged into one — resolving the superseded first run does nothing,
		// and the combined state commits once all async work has settled
		pop.click();
		await tick();
		assert.htmlEqual(p.innerHTML, `0 + 0 = 0 | 0 0`);

		shift.click();
		await tick();
		pop.click();
		await tick();
		assert.htmlEqual(p.innerHTML, `1 + 2 = 3 | 1 1`);
	}
});
