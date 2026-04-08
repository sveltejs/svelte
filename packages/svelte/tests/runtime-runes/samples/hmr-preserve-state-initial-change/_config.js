import { flushSync } from 'svelte';
import { HMR } from 'svelte/internal/client';
import { test } from '../../test';

export default test({
	skip_mode: ['hydrate'],
	compileOptions: {
		dev: true,
		hmr: true
	},

	html: `<button>count is 0</button>`,

	async test({ assert, target, mod }) {
		const button = target.querySelector('button');

		// Click 3 times to set count to 3
		flushSync(() => button?.click());
		flushSync(() => button?.click());
		flushSync(() => button?.click());
		assert.htmlEqual(target.innerHTML, `<button>count is 3</button>`);

		// Simulate HMR swap with same component (no initial change).
		// State should be preserved: count stays at 3.
		const hmr_data = mod.default[HMR];
		const fake_same = /** @type {any} */ ({ [HMR]: { fn: hmr_data.fn, current: null } });
		hmr_data.update(fake_same);
		flushSync();
		assert.htmlEqual(target.innerHTML, `<button>count is 3</button>`);

		// Now simulate HMR swap where the developer changed $state(0) to $state(10).
		// Import the pre-compiled "updated" version of the component.
		const updated = await import('./_output/client/Updated.svelte.js');
		const updated_fn = updated.default[HMR].fn;

		const fake_changed = /** @type {any} */ ({ [HMR]: { fn: updated_fn, current: null } });
		hmr_data.update(fake_changed);
		flushSync();

		// The initial value changed (0 → 10), so the preserved value (3)
		// should NOT be restored. The developer expects to see 10.
		assert.htmlEqual(target.innerHTML, `<button>count is 10</button>`);
	}
});
