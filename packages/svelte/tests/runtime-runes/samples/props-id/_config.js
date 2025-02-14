import { flushSync } from 'svelte';
import { test } from '../../test';

export default test({
	test({ assert, target, variant }) {
		const ps = [...target.querySelectorAll('p')].map((p) => p.innerHTML);
		const unique = new Set(ps);
		assert.equal(ps.length, unique.size);

		if (variant === 'hydrate') {
			const start = ps.map((p) => p.substring(0, 1));
			assert.deepEqual(start, ['s', 's', 's', 's']);
		}

		let button = target.querySelector('button');
		flushSync(() => button?.click());

		const ps_after = [...target.querySelectorAll('p')].map((p) => p.innerHTML);
		const unique_after = new Set(ps_after);
		assert.equal(ps_after.length, unique_after.size);

		if (variant === 'hydrate') {
			const start = ps_after.map((p) => p.substring(0, 1));
			assert.deepEqual(start, ['s', 's', 's', 's', 'c']);
		}
	}
});
