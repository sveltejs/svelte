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
			{ foo: false, bar: false },
			'up',
			{ foo: true, bar: true }
		]);
	}
});
