import { test } from '../../test';
import { flushSync } from 'svelte';

export default test({
	html: `<button>toggle (false)</button>`,

	async test({ assert, target, logs }) {
		assert.deepEqual(logs, ['up', { foo: false, bar: false }]);

		const button = target.querySelector('button');

		flushSync(() => button?.click());
		assert.deepEqual(logs, [
			'up',
			{ foo: false, bar: false },
			'down',
			// TODO the test should be deleted as there's no more concept of "teardown stale value"
			{ foo: true, bar: true },
			'up',
			{ foo: true, bar: true }
		]);
	}
});
