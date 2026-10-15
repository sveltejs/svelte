import { mount, settled, tick, unmount } from 'svelte';
import { test } from '../../test';

export default test({
	mode: ['hydrate'],
	skip_initial_flushSync: true,
	async test({ assert, target, mod, hydrate, logs }) {
		const apply = mod.prepare();
		await tick();

		// Keep an earlier, intersecting batch alive in a different component.
		mod.tree.data = { value: 'holding' };
		const holder_target = document.createElement('div');
		const holder = mount(mod.Holder, { target: holder_target, props: { tree: mod.tree } });

		try {
			await tick();
			apply();
			hydrate();
			await tick();
			assert.htmlEqual(target.innerHTML, '<p>ready</p>');
			assert.deepEqual(logs, ['ready']);
		} finally {
			await unmount(holder);
		}

		await settled();
	}
});
