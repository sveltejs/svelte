import { flushSync, tick } from 'svelte';
import { scene } from '../../renderer-shared';
import { test } from '../../test-dom.test';

const order = (/** @type {string} */ items) => [...items].map((item) => `<b>${item}</b>`).join('');

export default test({
	// all the children render into one shared container (see `renderer-shared.ts`), whose
	// content must follow the order of the children in the DOM
	target: 'dom',
	async test({ assert, target, serialize }) {
		await tick();
		assert.equal(serialize(scene), order('abc'));

		const [reverse, insert, rotate, remove] = target.querySelectorAll('button');

		// moved by a keyed `{#each}`, synced at the end of the flush
		reverse.click();
		flushSync();
		assert.equal(serialize(scene), order('cba'));

		// created in the middle, rather than appended
		insert.click();
		flushSync();
		assert.equal(serialize(scene), order('cxba'));

		rotate.click();
		flushSync();
		assert.equal(serialize(scene), order('acxb'));

		remove.click();
		flushSync();
		assert.equal(serialize(scene), order('acb'));
	}
});
