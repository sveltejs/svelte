import { flushSync } from 'svelte';
import { test } from '../../test';
import { normalise_trace_logs } from '../../../helpers.js';

export default test({
	compileOptions: {
		dev: true
	},

	test({ assert, target, logs }) {
		assert.deepEqual(normalise_trace_logs(logs), [
			{ log: 'effect' },
			{ log: '$state', highlighted: true },
			{ log: 'Counter.#count', highlighted: false },
			{ log: 0 }
		]);

		logs.length = 0;

		const button = target.querySelector('button');
		button?.click();
		flushSync();

		assert.deepEqual(normalise_trace_logs(logs), [
			{ log: 'effect' },
			{ log: '$state', highlighted: true },
			{ log: 'Counter.#count', highlighted: false },
			{ log: 1 }
		]);
	}
});
