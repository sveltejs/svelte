import { flushSync } from 'svelte';
import { HMR } from 'svelte/internal/client';
import { test } from '../../test';

export default test({
	compileOptions: {
		dev: true,
		hmr: true
	},

	html: `<button>count is 0</button>`,

	test({ assert, target, component }) {
		const button = target.querySelector('button');

		// Click 3 times to set count to 3
		flushSync(() => button?.click());
		flushSync(() => button?.click());
		flushSync(() => button?.click());
		assert.htmlEqual(target.innerHTML, `<button>count is 3</button>`);

		// Simulate HMR swap: update the component with itself
		// (same component function, as if only the template changed).
		// The $state(0) would normally reset to 0, but with state
		// preservation it should stay at 3.
		const wrapper = /** @type {any} */ (component);
		const hmr_data = wrapper[HMR];
		if (hmr_data && hmr_data.update) {
			const fake_incoming = /** @type {any} */ ({ [HMR]: { fn: hmr_data.fn, current: null } });
			hmr_data.update(fake_incoming);
			flushSync();
		}

		// State should be preserved: count stays at 3
		assert.htmlEqual(target.innerHTML, `<button>count is 3</button>`);
	}
});
