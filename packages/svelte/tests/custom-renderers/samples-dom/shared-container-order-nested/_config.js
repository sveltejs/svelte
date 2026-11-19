import { setImmediate } from 'node:timers/promises';
import { flushSync, mount, unmount } from 'svelte';
import { marker_order } from '../../renderer-shared-order';
import { test } from '../../test-dom.test';
import renderer_a, { scene_a } from './_renderer-a';
import { scene_b } from './_renderer-b';

export default test({
	target: 'dom',
	async test({ assert, mod, serialize, target }) {
		// Establish B's scene directly in A before adding the DOM list of A children.
		const singleton = mount(mod.Grandchild, {
			renderer: renderer_a,
			target: scene_a,
			props: { item: 'x' }
		});

		try {
			flushSync();
			assert.equal(serialize(scene_b), 'x');

			const [show, reverse] = target.querySelectorAll('button');
			const [output] = target.querySelectorAll('output');
			flushSync(() => show.click());
			await setImmediate();
			assert.equal(output.textContent, 'ab');
			assert.equal(marker_order(scene_a), 'xab');
			assert.equal(serialize(scene_b), 'xab');

			flushSync(() => reverse.click());
			assert.equal(output.textContent, 'ba');
			assert.equal(marker_order(scene_a), 'xba');
			assert.equal(serialize(scene_b), 'xba');
		} finally {
			await unmount(singleton);
		}
	}
});
