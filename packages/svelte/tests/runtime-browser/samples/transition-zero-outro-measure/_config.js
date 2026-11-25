import { flushSync } from 'svelte';
import { test } from '../../assert';

export default test({
	async test({ assert, target, waitUntil }) {
		const [button] = target.querySelectorAll('button');
		const [first, second] = target.querySelectorAll('div');
		const [output] = target.querySelectorAll('output');
		const top = second.getBoundingClientRect().top;

		flushSync(() => button.click());

		// The first branch must not be removed until its sibling has measured.
		assert.equal(Number(output.textContent), top);
		// Zero-duration transitions now complete through WAAPI, not inside flushSync.
		assert.equal(first.isConnected, true);

		// Missing configurations/durations (including deferred ones) must also finish.
		await waitUntil(() => !first.isConnected && !target.querySelector('span'));
		assert.equal(first.isConnected, false);
		assert.equal(second.isConnected, true);
		assert.equal(target.querySelectorAll('span').length, 0);
	}
});
