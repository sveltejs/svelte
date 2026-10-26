import { flushSync } from 'svelte';
import { HMR } from 'svelte/internal/client';
import { test } from '../../test';

export default test({
	compileOptions: {
		dev: true,
		hmr: true
	},
	snapshot(target) {
		return {
			snippet: target.querySelector('.snippet'),
			default: target.querySelector('.default .child'),
			named: target.querySelector('.named .child')
		};
	},
	async test(assert, target, snapshot) {
		const path = './_output/client/Child' + '.svelte.js';
		const { default: Child } = await import(/* vite-ignore */ path);
		const hmr = Child[HMR];

		// Replacing the child must still render inside the enclosing DOM range
		hmr.update({
			[HMR]: { fn: /** @param {any} args */ (...args) => hmr.fn(...args) }
		});
		flushSync();

		assert.notStrictEqual(target.querySelector('.default .child'), snapshot.default);
		assert.notStrictEqual(target.querySelector('.named .child'), snapshot.named);
		assert.htmlEqual(
			target.innerHTML,
			'<div class="snippet"><div class="default"><span class="child">child</span></div><div class="named"><span class="child">child</span></div></div>'
		);
	}
});
