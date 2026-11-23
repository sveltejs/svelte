import { flushSync, mount, unmount } from 'svelte';
import { marker_order } from '../../renderer-shared-order';
import { test } from '../../test-dom.test';
import { scene } from './_renderer';

export default test({
	async test({ assert, dispatch_event, mod, renderer, serialize, target }) {
		// The first crossing is in its own host root, separate from the keyed list.
		const detached = renderer.createFragment();
		const singleton = mount(mod.Child, { renderer, target: detached, props: { item: 'x' } });

		try {
			flushSync();
			assert.equal(serialize(scene), 'x');

			const [show, reverse] = /** @type {import('../../renderer').ObjFragment} */ (
				target
			).children.filter((node) => node.type === 'element' && node.name === 'button');
			flushSync(() => dispatch_event(show, 'click'));
			assert.equal(marker_order(detached), 'x');
			assert.equal(marker_order(target), 'ab');
			assert.equal(serialize(scene), 'xab');

			flushSync(() => dispatch_event(reverse, 'click'));
			assert.equal(marker_order(detached), 'x');
			assert.equal(marker_order(target), 'ba');
			assert.equal(serialize(scene), 'xba');
		} finally {
			await unmount(singleton);
		}
	}
});
