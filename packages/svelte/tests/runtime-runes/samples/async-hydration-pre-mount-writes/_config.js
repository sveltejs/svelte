import { settled, tick } from 'svelte';
import { test } from '../../test';

export default test({
	mode: ['hydrate'],
	skip_initial_flushSync: true,
	async test({ assert, target, mod, hydrate, logs }) {
		const apply = mod.prepare();
		// Drain construction, but not the final writes to the existing root.
		await tick();
		apply();
		hydrate();
		await settled();
		assert.htmlEqual(
			target.innerHTML,
			'<div>Resolving a promise here: ok</div><div>this is the child</div>'.repeat(2)
		);
		assert.deepEqual(logs, ['root', 'child', 'root', 'child']);

		mod.tree.child.data = { root: 'updated root', child: 'updated child' };
		await settled();
		assert.deepEqual(logs, [
			'root',
			'child',
			'root',
			'child',
			'updated root',
			'updated child',
			'updated root',
			'updated child'
		]);
	}
});
