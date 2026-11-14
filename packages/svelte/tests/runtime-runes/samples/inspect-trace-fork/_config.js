import { flushSync } from 'svelte';
import { test } from '../../test';
import { normalise_trace_logs } from '../../../helpers.js';

// `$inspect.trace` shows the values, dependencies and changes as the view of the batch the reaction runs in sees them
export default test({
	skip_no_async: true,

	compileOptions: {
		dev: true
	},

	test({ assert, target, logs }) {
		const [fork, a, b] = target.querySelectorAll('button');

		logs.length = 0;

		// in the fork, `traced` depends on `a` instead of `b`, which has the same value
		fork.click();
		flushSync();

		assert.deepEqual(normalise_trace_logs(logs), []);

		// `traced` re-runs in the fork's view, once `a` is committed
		a.click();
		flushSync();

		assert.deepEqual(normalise_trace_logs(logs), [
			{ log: 'traced' },
			{ log: '$derived', highlighted: true },
			{ log: 'foo', highlighted: false },
			{ log: 2 },
			{ log: '$state', highlighted: true },
			{ log: 'condition', highlighted: false },
			{ log: true },
			{ log: '$state', highlighted: true },
			{ log: 'a', highlighted: false },
			{ log: 2 }
		]);

		logs.length = 0;

		a.click();
		flushSync();

		assert.deepEqual(normalise_trace_logs(logs), [
			{ log: 'traced' },
			{ log: '$derived', highlighted: true },
			{ log: 'foo', highlighted: false },
			{ log: 3 },
			{ log: '$state', highlighted: false },
			{ log: 'condition', highlighted: false },
			{ log: true },
			{ log: '$state', highlighted: true },
			{ log: 'a', highlighted: false },
			{ log: 3 }
		]);

		logs.length = 0;

		// `traced` re-runs in the real world
		b.click();
		flushSync();

		assert.deepEqual(normalise_trace_logs(logs), [
			{ log: 'traced' },
			{ log: '$derived', highlighted: true },
			{ log: 'foo', highlighted: false },
			{ log: 2 },
			{ log: '$state', highlighted: false },
			{ log: 'condition', highlighted: false },
			{ log: false },
			{ log: '$state', highlighted: true },
			{ log: 'b', highlighted: false },
			{ log: 2 }
		]);

		assert.htmlEqual(
			target.innerHTML,
			'<button>fork</button><button>a</button><button>b</button><p>2</p>'
		);
	}
});
