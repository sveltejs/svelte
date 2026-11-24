import { flushSync } from 'svelte';
import { test } from '../../test';
import { normalise_inspect_logs } from '../../../helpers.js';

export default test({
	skip_no_async: true,

	compileOptions: {
		dev: true
	},

	test({ assert, target, logs }) {
		const [discard, commit, other] = target.querySelectorAll('button');

		assert.deepEqual(normalise_inspect_logs(logs), [0]);

		// writes in a fork don't change the real world, so `$inspect` doesn't log...
		flushSync(() => discard.click());
		assert.deepEqual(normalise_inspect_logs(logs), [0]);

		// ...nor does it log later, when an unrelated write flushes eager effects
		flushSync(() => other.click());
		assert.deepEqual(normalise_inspect_logs(logs), [0]);

		// it logs once the fork is committed
		flushSync(() => commit.click());
		assert.deepEqual(normalise_inspect_logs(logs), [0, 1, 'at HTMLButtonElement.click_1']);
	}
});
