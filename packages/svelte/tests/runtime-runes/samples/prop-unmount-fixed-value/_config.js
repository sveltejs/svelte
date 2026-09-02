import { flushSync } from 'svelte';
import { test } from '../../test';
import { vi } from 'vitest';

export default test({
	before_test() {
		vi.useFakeTimers();
	},
	after_test() {
		vi.useRealTimers();
	},
	test({ assert, logs, raf, target }) {
		const toggle = target.querySelector('button');

		flushSync(() => toggle?.click());
		target.querySelectorAll('button')[1]?.click();
		flushSync(() => toggle?.click());

		raf.tick(100);
		raf.tick(200);
		vi.advanceTimersByTime(1000);

		assert.deepEqual(logs, [
			'PARENT: set value to',
			true,
			'CHILD: mount value is',
			true,
			'PARENT: set value to',
			false,
			'CHILD: outro value is',
			true,
			'CHILD: unmount value is',
			true,
			'CHILD: timeout value is',
			true
		]);
	}
});
