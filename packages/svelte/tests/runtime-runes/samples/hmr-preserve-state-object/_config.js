import { flushSync } from 'svelte';
import { HMR } from 'svelte/internal/client';
import { test } from '../../test';

export default test({
	compileOptions: {
		dev: true,
		hmr: true
	},

	html: `<button>clicks: 0</button>`,

	test({ assert, target, mod }) {
		const button = target.querySelector('button');

		// Click 3 times — mutates the object's count property
		flushSync(() => button?.click());
		flushSync(() => button?.click());
		flushSync(() => button?.click());
		assert.htmlEqual(target.innerHTML, `<button>clicks: 3</button>`);

		// HMR swap with same component. The initial value is an object
		// { count: 0, label: 'clicks' }, so deep equality is needed to
		// detect that the initial hasn't changed and state should restore.
		const hmr_data = mod.default[HMR];
		const fake_incoming = /** @type {any} */ ({ [HMR]: { fn: hmr_data.fn, current: null } });
		hmr_data.update(fake_incoming);
		flushSync();

		// Object state should be preserved — deep_equal matched the initial
		assert.htmlEqual(target.innerHTML, `<button>clicks: 3</button>`);
	}
});
