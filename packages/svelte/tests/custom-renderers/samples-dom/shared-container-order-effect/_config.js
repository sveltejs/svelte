import { flushSync, mount, unmount } from 'svelte';
import { marker_order } from '../../renderer-shared-order';
import { test } from '../../test-dom.test';
import renderer, { guest } from './_renderer';

export default test({
	target: 'dom',
	async test({ assert, dispatch_event, mod }) {
		const root = renderer.createFragment();
		/** @type {{ keys: string; host: string; guest: string | null }[]} */
		const reads = [];
		/** @param {string} keys */
		const observe = (keys) => {
			reads.push({ keys, host: marker_order(root), guest: guest.textContent });
		};

		// DOM children of a custom host render into one shared DOM container, which an
		// `$effect` in the host reads: it must see the container in its updated order
		const list = mount(mod.List, { renderer, target: root, props: { observe } });

		try {
			flushSync();
			assert.deepEqual(reads, [{ keys: 'ab', host: 'ab', guest: 'ab' }]);

			const reverse = root.children.find(
				(node) => node.type === 'element' && node.name === 'button'
			);
			flushSync(() => dispatch_event(reverse, 'click'));
			assert.equal(marker_order(root), 'ba');
			assert.equal(guest.textContent, 'ba');
			assert.deepEqual(reads[1], { keys: 'ba', host: 'ba', guest: 'ba' });
			assert.equal(reads.length, 2);
		} finally {
			await unmount(list);
		}
	}
});
