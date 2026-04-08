import { flushSync } from 'svelte';
import { HMR } from 'svelte/internal/client';
import { test } from '../../test';

export default test({
	compileOptions: {
		dev: true,
		hmr: true
	},

	html: `<button class="parent">parent: 1</button><button class="child">child: 0</button>`,

	test({ assert, target, mod }) {
		const parent_btn = target.querySelector('button.parent');
		const child_btn = target.querySelector('button.child');

		// Click parent to increase count to 2 (adds another Counter)
		flushSync(() => parent_btn?.click());
		assert.htmlEqual(
			target.innerHTML,
			`<button class="parent">parent: 2</button><button class="child">child: 0</button><button class="child">child: 0</button>`
		);

		// Click the first child counter 5 times
		for (let i = 0; i < 5; i++) {
			flushSync(() => target.querySelector('button.child')?.click());
		}

		assert.htmlEqual(
			target.innerHTML,
			`<button class="parent">parent: 2</button><button class="child">child: 5</button><button class="child">child: 0</button>`
		);

		// Simulate HMR swap on the parent component.
		// Without collision prevention, the parent's `count` could be
		// overwritten by a child's `count` value, destroying children.
		const hmr_data = mod.default[HMR];
		if (hmr_data && hmr_data.update) {
			const fake_incoming = /** @type {any} */ ({ [HMR]: { fn: hmr_data.fn, current: null } });
			hmr_data.update(fake_incoming);
			flushSync();
		}

		// Parent count should still be 2, not corrupted by child's count
		// Children should still be rendered (2 of them)
		assert.htmlEqual(
			target.innerHTML,
			`<button class="parent">parent: 2</button><button class="child">child: 5</button><button class="child">child: 0</button>`
		);
	}
});
