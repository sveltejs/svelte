import { flushSync } from 'svelte';
import { test } from '../../test';

// #15604 — a removed each item mid-outro must not be resurrected by an ancestor pause/resume
export default test({
	test({ assert, target, raf }) {
		const [remove, fetch] = target.querySelectorAll('button');

		raf.tick(200);
		assert.equal(target.querySelectorAll('.item').length, 3);

		flushSync(() => remove.click());

		flushSync(() => fetch.click());
		raf.tick(30);

		flushSync(() => fetch.click());
		raf.tick(2000);

		const items = [...target.querySelectorAll('.item')].map((el) => el.textContent);
		assert.deepEqual(items, ['a', 'c']);
	}
});
