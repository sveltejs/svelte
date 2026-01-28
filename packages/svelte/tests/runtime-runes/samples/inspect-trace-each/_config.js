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
			{ log: 'array', highlighted: false },
			{ log: [{ id: 1, hi: true }] },
			// this _doesn't_ appear in the browser, but it does appear during tests
			// and i cannot for the life of me figure out why. this does at least
			// test that we don't log `array[0].id` etc
			{ log: '$state', highlighted: true },
			{ log: 'array[0]', highlighted: false },
			{ log: { id: 1, hi: true } }
		]);

		logs.length = 0;

		const button = target.querySelector('button');
		button?.click();
		flushSync();

		assert.deepEqual(normalise_trace_logs(logs), [
			{ log: 'effect' },
			{ log: '$state', highlighted: true },
			{ log: 'array', highlighted: false },
			{ log: [{ id: 1, hi: false }] },
			{ log: '$state', highlighted: false },
			{ log: 'array[0]', highlighted: false },
			{ log: { id: 1, hi: false } }
		]);
	}
});
