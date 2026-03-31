import { flushSync } from 'svelte';
import { HMR } from 'svelte/internal/client';
import { test } from '../../test';

export default test({
	compileOptions: {
		dev: true,
		hmr: true
	},

	html: `<button>count: 0</button>`,

	test({ assert, target, mod }) {
		const button = target.querySelector('button');

		// Click 3 times
		flushSync(() => button?.click());
		flushSync(() => button?.click());
		flushSync(() => button?.click());
		assert.htmlEqual(target.innerHTML, `<button>count: 3</button>`);

		// HMR swap the parent component — composable state should be preserved
		const hmr_data = mod.default[HMR];
		const fake_incoming = /** @type {any} */ ({ [HMR]: { fn: hmr_data.fn, current: null } });
		hmr_data.update(fake_incoming);
		flushSync();

		// Composable's $state should be preserved across parent HMR
		assert.htmlEqual(target.innerHTML, `<button>count: 3</button>`);
	}
});
