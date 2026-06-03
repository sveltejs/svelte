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
			{ log: 'store', highlighted: true },
			{ log: '$count', highlighted: false },
			{ log: 0 }
		]);

		logs.length = 0;

		const [button] = target.querySelectorAll('button');
		flushSync(() => button.click());

		assert.deepEqual(normalise_trace_logs(logs), [
			{ log: 'effect' },
			{ log: 'store', highlighted: true },
			{ log: '$count', highlighted: false },
			{ log: 1 }
		]);
	}
});
