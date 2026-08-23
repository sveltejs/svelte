import { flushSync } from 'svelte';
import { test } from '../../test';

// #15604 companion — flipping the condition back while the ancestor is paused must still revive the element
export default test({
	test({ assert, target, raf }) {
		const [toggle, fetch] = target.querySelectorAll('button');

		raf.tick(200);
		assert.ok(target.querySelector('.red'));

		flushSync(() => toggle.click());

		flushSync(() => fetch.click());
		raf.tick(30);

		flushSync(() => toggle.click());

		flushSync(() => fetch.click());
		raf.tick(2000);

		assert.ok(target.querySelector('.red'));
	}
});
