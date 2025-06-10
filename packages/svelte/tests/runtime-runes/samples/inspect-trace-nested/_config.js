import { flushSync } from 'svelte';
import { test } from '../../test';
import { normalise_trace_logs } from '../../../helpers.js';

export default test({
	compileOptions: {
		dev: true
	},

	test({ assert, target, logs }) {
		// initial log, everything is highlighted

		assert.deepEqual(normalise_trace_logs(logs), [
			{ log: 'iife', highlighted: false },
			{ log: 'count — $state', highlighted: true },
			{ log: 0 },
			{ log: 'effect', highlighted: false }
		]);

		logs.length = 0;

		const button = target.querySelector('button');
		button?.click();
		flushSync();

		assert.deepEqual(normalise_trace_logs(logs), [
			{ log: 'iife', highlighted: false },
			{ log: 'count — $state', highlighted: true },
			{ log: 1 },
			{ log: 'effect', highlighted: false }
		]);
	}
});
