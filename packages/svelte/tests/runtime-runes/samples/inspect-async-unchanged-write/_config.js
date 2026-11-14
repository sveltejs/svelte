import { tick } from 'svelte';
import { test } from '../../test';

export default test({
	skip_no_async: true,

	compileOptions: {
		dev: true
	},

	async test({ assert, target, logs }) {
		const [a, b, ...rest] = target.querySelectorAll('button');
		const resolve = Object.fromEntries(rest.map((button) => [button.textContent, button]));

		resolve['d:0'].click();
		await tick();
		resolve['e:0'].click();
		await tick();

		assert.equal(target.querySelector('p')?.textContent, 'zero 0');
		assert.deepEqual(logs, ['init: zero']);

		// one batch re-runs `d`...
		a.click();
		await tick();

		// ...and a later one re-runs `d` and `e` (seeing the earlier batch's write, since both re-run `d`)
		b.click();
		await tick();

		// the later batch's `d` resolves first (while it still waits for `e`), changing its real-world value
		resolve['d:11'].click();
		await tick();
		assert.deepEqual(logs, ['init: zero', 'update: positive']);

		// the earlier batch's `d` resolves to the value `d` already has, so `$inspect` doesn't log
		resolve['d:1'].click();
		await tick();
		assert.deepEqual(logs, ['init: zero', 'update: positive']);
	}
});
