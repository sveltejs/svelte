import { tick } from 'svelte';
import { test } from '../../test';

// When a later batch's write is hidden from an earlier batch, its write version must be
// hidden as well — otherwise reactions of that source look dirty to the earlier batch
// and re-run even though they see the old (unchanged) value
export default test({
	async test({ assert, target, instance }) {
		const [x, s, resolve] = target.querySelectorAll('button');

		resolve.click();
		await tick();
		resolve.click();
		await tick();
		assert.deepEqual(instance.get_logs(), ['0/true']);

		x.click(); // B1: slow(x = 2) pending; `d` stays true
		await tick();
		s.click(); // B2: slow(s = 1) pending; the $effect is dirtied by `s` and deferred in B2
		await tick();
		assert.deepEqual(instance.get_logs(), ['0/true']);

		// B1 commits while B2 is pending. In B1's world nothing the effect depends on changed
		// (`s` is hidden and still 0, `d` is still true), so it must not run
		resolve.click();
		await tick();
		assert.deepEqual(instance.get_logs(), ['0/true']);

		resolve.click();
		await tick();
		assert.deepEqual(instance.get_logs(), ['0/true', '1/true']);
	}
});
