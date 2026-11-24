import { flushSync } from 'svelte';
import { test } from '../../test';

export default test({
	test({ assert, target, logs }) {
		const [button] = target.querySelectorAll('button');
		const [output] = target.querySelectorAll('output');

		assert.deepEqual(logs, ['a: 1']);

		flushSync(() => button.click());
		assert.htmlEqual(output.innerHTML, '<p>1</p><p>2</p>');

		// each entry is a new array, but `k` and `v` are unchanged for `a`,
		// so its expression shouldn't re-run
		assert.deepEqual(logs, ['a: 1', 'b: 2']);
	}
});
