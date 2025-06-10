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
			{ log: 'effect', highlighted: false },
			{ log: 'checked — $state', highlighted: true },
			{ log: false }
		]);

		logs.length = 0;

		const button = target.querySelector('button');
		button?.click();
		flushSync();

		const input = target.querySelector('input');
		input?.click();
		flushSync();

		// checked changed, effect reassign state, values should be correct and be correctly highlighted

		assert.deepEqual(normalise_trace_logs(logs), [
			{ log: 'effect', highlighted: false },
			{ log: 'checked — $state', highlighted: true },
			{ log: true },
			{ log: 'count — $state', highlighted: true },
			{ log: 1 },
			{ log: 'effect', highlighted: false },
			{ log: 'checked — $state', highlighted: false },
			{ log: true },
			{ log: 'count — $state', highlighted: true },
			{ log: 2 },
			{ log: 'effect', highlighted: false },
			{ log: 'checked — $state', highlighted: false },
			{ log: true },
			{ log: 'count — $state', highlighted: true },
			{ log: 3 }
		]);
	}
});
