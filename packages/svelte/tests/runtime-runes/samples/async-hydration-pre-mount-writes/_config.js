import { settled } from 'svelte';
import { test } from '../../test';

// Regression test for https://github.com/sveltejs/kit/issues/17383
export default test({
	mode: ['hydrate'],
	skip_initial_flushSync: true,

	async test({ assert, target, component, mod, hydrate, logs }) {
		const tree = mod.create_tree();
		const { data, child } = tree;
		tree.data = {};
		tree.child = undefined;
		component.tree = tree;
		await Promise.resolve();

		// Kit applies the loaded data to its existing root immediately before hydration.
		// Do not flush these writes: the async boundary must encounter the pending batch.
		tree.data = data;
		tree.child = child;
		hydrate();
		await settled();

		assert.htmlEqual(
			target.innerHTML,
			'<div>Resolving a promise here: ok</div><div>this is the child</div>'
		);
		assert.deepEqual(logs, ['root', 'child']);
	}
});
