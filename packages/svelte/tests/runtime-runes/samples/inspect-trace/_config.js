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
			{ log: 'effect' },
			{ log: '$derived', highlighted: true },
			{ log: 'double', highlighted: false },
			{ log: 0 },
			{ log: '$state', highlighted: true },
			{ log: 'count', highlighted: false },
			{ log: 0 },
			{ log: '$state', highlighted: true },
			{ log: 'checked', highlighted: false },
			{ log: false }
		]);

		logs.length = 0;

		const button = target.querySelector('button');
		button?.click();
		flushSync();

		// count changed, derived and state are highlighted, last state is not

		assert.deepEqual(normalise_trace_logs(logs), [
			{ log: 'effect' },
			{ log: '$derived', highlighted: true },
			{ log: 'double', highlighted: false },
			{ log: 2 },
			{ log: '$state', highlighted: true },
			{ log: 'count', highlighted: false },
			{ log: 1 },
			{ log: '$state', highlighted: false },
			{ log: 'checked', highlighted: false },
			{ log: false }
		]);

		logs.length = 0;

		const input = target.querySelector('input');
		input?.click();
		flushSync();

		// checked changed, last state is highlighted, first two are not

		assert.deepEqual(normalise_trace_logs(logs), [
			{ log: 'effect' },
			{ log: '$derived', highlighted: false },
			{ log: 'double', highlighted: false },
			{ log: 2 },
			{ log: '$state', highlighted: false },
			{ log: 'count', highlighted: false },
			{ log: 1 },
			{ log: '$state', highlighted: true },
			{ log: 'checked', highlighted: false },
			{ log: true }
		]);

		logs.length = 0;

		button?.click();
		flushSync();

		// count change and derived it's >=4, checked is not in the dependencies anymore

		assert.deepEqual(normalise_trace_logs(logs), [
			{ log: 'effect' },
			{ log: '$derived', highlighted: true },
			{ log: 'double', highlighted: false },
			{ log: 4 },
			{ log: '$state', highlighted: true },
			{ log: 'count', highlighted: false },
			{ log: 2 }
		]);
	}
});
