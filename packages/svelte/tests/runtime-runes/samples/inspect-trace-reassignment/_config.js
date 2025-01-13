import { flushSync } from 'svelte';
import { test } from '../../test';

/**
 * @param {any[]} logs
 */
function normalise_trace_logs(logs) {
	let normalised = [];
	for (let i = 0; i < logs.length; i++) {
		const log = logs[i];

		if (typeof log === 'string' && log.includes('%c')) {
			const split = log.split('%c');
			normalised.push({
				log: (split[0].length !== 0 ? split[0] : split[1]).trim(),
				highlighted: logs[i + 1] === 'color: CornflowerBlue; font-weight: bold'
			});
			i++;
		} else if (log instanceof Error) {
			continue;
		} else {
			normalised.push({ log });
		}
	}
	return normalised;
}

export default test({
	compileOptions: {
		dev: true
	},

	test({ assert, target, logs }) {
		// initial log, everything is highlighted

		assert.deepEqual(normalise_trace_logs(logs), [
			{ log: 'effect', highlighted: false },
			{ log: '$state', highlighted: true },
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
			{ log: '$state', highlighted: true },
			{ log: true },
			{ log: '$state', highlighted: true },
			{ log: 1 },
			{ log: 'effect', highlighted: false },
			{ log: '$state', highlighted: false },
			{ log: true },
			{ log: '$state', highlighted: true },
			{ log: 2 },
			{ log: 'effect', highlighted: false },
			{ log: '$state', highlighted: false },
			{ log: true },
			{ log: '$state', highlighted: true },
			{ log: 3 }
		]);
	}
});
