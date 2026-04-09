import { flushSync } from 'svelte';
import { HMR } from 'svelte/internal/client';
import { test } from '../../test';

export default test({
	compileOptions: {
		dev: true,
		hmr: true
	},

	async test({ assert, target }) {
		const [btn] = target.querySelectorAll('button');

		btn.click();
		flushSync();
		assert.htmlEqual(target.innerHTML, `<button>show</button> component`);

		// Simulate HMR swap on the child component.
		const hidden = './_output/client/Component' + '.svelte.js';
		const mod = await import(/* vite-ignore */ hidden);
		const hmr_data = mod.default[HMR];
		const fake_incoming = {
			// Fake a new component, else HMR source's equality check will ignore the update
			[HMR]: { fn: /** @param {any} args */ (...args) => hmr_data.fn(...args), current: null }
		};
		hmr_data.update(fake_incoming);
		flushSync();
		assert.htmlEqual(target.innerHTML, `<button>show</button> component`);
	}
});
