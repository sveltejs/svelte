import { flushSync } from 'svelte';
import { test } from '../../test';

export default test({
	test({ assert, target, warnings }) {
		const [close, change, set] = target.querySelectorAll('button');

		flushSync(() => close.click());
		flushSync(() => change.click());
		flushSync(() => set.click());

		assert.deepEqual(warnings, []);
	}
});
