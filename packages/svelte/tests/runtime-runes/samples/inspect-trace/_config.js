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
			{ log: '$derived', highlighted: true },
			{ log: 0 },
			{ log: 'count — $state', highlighted: true },
			{ log: 0 },
			{ log: 'checked — $state', highlighted: true },
			{ log: false }
		]);

		logs.length = 0;

		const button = target.querySelector('button');
		button?.click();
		flushSync();

		// count changed, derived and state are highlighted, last state is not

		assert.deepEqual(normalise_trace_logs(logs), [
			{ log: 'effect', highlighted: false },
			{ log: 'double — $derived', highlighted: true },
			{ log: 2 },
			{ log: 'count — $state', highlighted: true },
			{ log: 1 },
			{ log: 'checked — $state', highlighted: false },
			{ log: false }
		]);

		logs.length = 0;

		const input = target.querySelector('input');
		input?.click();
		flushSync();

		// checked changed, last state is highlighted, first two are not

		assert.deepEqual(normalise_trace_logs(logs), [
			{ log: 'effect', highlighted: false },
			{ log: 'double — $derived', highlighted: false },
			{ log: 2 },
			{ log: 'count — $state', highlighted: false },
			{ log: 1 },
			{ log: 'checked — $state', highlighted: true },
			{ log: true }
		]);

		logs.length = 0;

		button?.click();
		flushSync();

		// count change and derived it's >=4, checked is not in the dependencies anymore

		assert.deepEqual(normalise_trace_logs(logs), [
			{ log: 'effect', highlighted: false },
			{ log: 'double — $derived', highlighted: true },
			{ log: 4 },
			{ log: 'count — $state', highlighted: true },
			{ log: 2 }
		]);
	}
});
