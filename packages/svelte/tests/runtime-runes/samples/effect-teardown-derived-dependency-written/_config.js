import { flushSync } from 'svelte';
import { test } from '../../test';

// Deriveds that a teardown evaluates reflect what it writes afterwards
export default test({
	test({ assert, target, logs }) {
		const button = target.querySelector('button');

		flushSync(() => button?.click());
		assert.deepEqual(logs, [
			{ a: 0, b: 0, c: 0 },
			{ a: 1, b: 1, c: 1 }
		]);

		flushSync(() => button?.click());
		assert.deepEqual(logs, [
			{ a: 0, b: 0, c: 0 },
			{ a: 1, b: 1, c: 1 },
			{ a: 1, b: 1, c: 1 },
			{ a: 2, b: 4, c: 16 }
		]);
	}
});
