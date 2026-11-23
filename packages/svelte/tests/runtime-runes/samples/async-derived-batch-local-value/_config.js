import { tick } from 'svelte';
import { test } from '../../test';

export default test({
	async test({ assert, target, logs }) {
		await tick();
		const [a, b, log, resolve] = target.querySelectorAll('button');
		const [p] = target.querySelectorAll('p');

		assert.deepEqual(logs, ['effect 0']);
		logs.length = 0;

		// batch A is pending
		a.click();
		await tick();
		assert.htmlEqual(p.innerHTML, '0 0');

		// batch B commits right away, in a view of the world without A's change
		b.click();
		await tick();
		assert.htmlEqual(p.innerHTML, '0 -1');
		assert.deepEqual(logs, ['effect -1']);
		logs.length = 0;

		// outside of any batch, `d` has its real value (and is only computed once
		// for that, as it wasn't computed with the real values before)
		log.click();
		await tick();
		assert.deepEqual(logs, ['real 0 3']);
		logs.length = 0;

		// batch A commits: `d` is 0 again, like before B — but the effect last saw -1
		// (a value that only existed in B's view), so it must re-run. `d` is not re-computed
		resolve.click();
		await tick();
		assert.htmlEqual(p.innerHTML, '1 0');
		assert.deepEqual(logs, ['effect 0']);
		logs.length = 0;

		log.click();
		await tick();
		assert.deepEqual(logs, ['real 0 3']);
	}
});
