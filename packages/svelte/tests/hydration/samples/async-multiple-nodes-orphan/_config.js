import { flushSync, tick } from 'svelte';
import { test } from '../../test';

export default test({
	compileOptions: {
		experimental: {
			async: true
		}
	},
	async test(assert, target) {
		// allow the async boundaries (real macrotask delays) to settle after hydration
		await new Promise((resolve) => setTimeout(resolve, 50));
		await tick();

		assert.htmlEqual(
			target.innerHTML,
			`
				<button>hide</button>
				<div class="page-container">
					<header class="child-header">header</header>
					<main class="child-main">content</main>
					<footer class="child-footer">footer</footer>
				</div>
			`
		);

		// destroy only the inner async subtree (simulates navigating away). The
		// `.page-container` survives, so any leftover siblings would be orphaned.
		target.querySelector('button')?.click();
		flushSync();
		await tick();

		const container = target.querySelector('.page-container');
		if (!container) {
			assert.ok(false, 'Expected .page-container to survive');
			return;
		}
		assert.htmlEqual(container.innerHTML, '');
	}
});
