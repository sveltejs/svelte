import { test } from '../../test';
import { flushSync } from 'svelte';

export default test({
	async test({ assert, target, instance }) {
		const [increment, error, toggle] = target.querySelectorAll('button');

		flushSync(() => increment.click());
		await Promise.resolve();
		assert.deepEqual(instance.snapshot(), {
			signals: [
				{ value: 0, aborted: true },
				{ value: 1, aborted: false },
				{ value: 0, aborted: true }
			],
			cleanup: [0],
			subscriptions: 1
		});

		// Resources created before a historical evaluation throws must also be disposed.
		flushSync(() => error.click());
		await Promise.resolve();
		assert.deepEqual(instance.snapshot(), {
			signals: [
				{ value: 0, aborted: true },
				{ value: 1, aborted: true },
				{ value: 0, aborted: true },
				{ value: 2, aborted: false },
				{ value: 1, aborted: true }
			],
			cleanup: [0, 'historical error'],
			subscriptions: 1
		});

		flushSync(() => toggle.click());
		await Promise.resolve();
		assert.equal(instance.snapshot().subscriptions, 0);
		for (const signal of instance.snapshot().signals) {
			assert.ok(signal.aborted);
		}
	}
});
