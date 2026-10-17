import { tick } from 'svelte';
import { test } from '../../test';

export default test({
	async test({ assert, target }) {
		await tick();
		const [flip, swap, release] = target.querySelectorAll('button');
		const html = () => [...target.querySelectorAll('span')].map((s) => s.textContent).join('');

		assert.equal(html(), 'a0a1a2', 'initial');

		// swap: the new branches are deferred, so they land offscreen in a fragment
		swap.click();
		await tick();
		// reorder while the swap is still pending
		flip.click();
		await tick();
		for (let i = 0; i < 3; i++) {
			release.click();
			await tick();
		}
		await tick();
		assert.equal(html(), 'b2b1b0', 'reorder while swap pending');
	}
});
