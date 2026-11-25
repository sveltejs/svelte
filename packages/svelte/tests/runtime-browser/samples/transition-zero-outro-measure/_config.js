import { flushSync } from 'svelte';
import { test } from '../../assert';

export default test({
	test({ assert, target }) {
		const [button] = target.querySelectorAll('button');
		const [first, second] = target.querySelectorAll('div');
		const [output] = target.querySelectorAll('output');
		const top = second.getBoundingClientRect().top;

		flushSync(() => button.click());

		// The first branch must not be removed until its sibling has measured.
		assert.equal(Number(output.textContent), top);
		// Completion still happens inside flushSync, without waiting for a frame.
		assert.equal(first.isConnected, false);
		assert.equal(second.isConnected, true);
	}
});
