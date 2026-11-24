import { flushSync } from 'svelte';
import { HMR } from '../../../../src/constants.js';
import { EFFECT_TRANSPARENT } from '../../../../src/internal/client/constants.js';
import { active_effect } from '../../../../src/internal/client/runtime.js';
import { connections } from '../../renderer';
import { test } from '../../test-dom.test';

/** @type {Record<string, number[]>} */
const wrappers = { main: [], child: [] };

// called from `main.svelte` and `Child.svelte` (this module is loaded before they're mounted):
// counts the transparent effects (which include the HMR wrappers' blocks) above the component
// @ts-expect-error
globalThis.__record_hmr_wrappers = (/** @type {string} */ name) => {
	let count = 0;
	for (let effect = active_effect; effect !== null; effect = effect.parent) {
		if (effect.f & EFFECT_TRANSPARENT) count++;
	}
	wrappers[name].push(count);
};

export default test({
	// with HMR, a component's binding is reassigned to the HMR wrapper. When the component
	// crosses into another renderer it calls itself again, which must not go through the
	// wrapper a second time
	target: 'dom',
	compileOptions: { dev: true, hmr: true },
	async test({ assert, target, serialize_dom }) {
		// The compiled module doesn't exist when this file is loaded, so hide the imports from
		// Vite's import analysis. This is the module instance `main` imports...
		const child = './_output/client/Child.svelte.js';
		const { default: Child } = await import(/* @vite-ignore */ child);
		// ...and a fresh instance, standing in for the updated module
		const { default: Next } = await import(/* @vite-ignore */ `${child}?next`);

		assert.equal(
			serialize_dom(target),
			'<button>update</button> <custom-root><b>hello</b></custom-root>'
		);
		// the child is inside exactly one more HMR wrapper than `main`: its own
		const [outside] = wrappers.main;
		assert.deepEqual(wrappers.child, [outside + 1]);
		const root = target.querySelector('custom-root');

		target.querySelector('button')?.click();
		flushSync();
		assert.equal(
			serialize_dom(target),
			'<button>update</button> <custom-root><b>hello!</b></custom-root>'
		);

		// a hot update replaces the child, including its crossing...
		flushSync(() => Child[HMR].update(Next));
		assert.equal(
			serialize_dom(target),
			'<button>update</button> <custom-root><b>hello!</b></custom-root>'
		);
		assert.notEqual(target.querySelector('custom-root'), root);
		assert.equal(connections.open, 1);
		assert.deepEqual(wrappers.child, [outside + 1, outside + 1]);

		// ...and the new version still receives prop updates
		target.querySelector('button')?.click();
		flushSync();
		assert.equal(
			serialize_dom(target),
			'<button>update</button> <custom-root><b>hello!!</b></custom-root>'
		);

		// @ts-expect-error
		delete globalThis.__record_hmr_wrappers;
	}
});
