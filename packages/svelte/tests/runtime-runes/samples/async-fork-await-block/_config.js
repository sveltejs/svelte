import { fork, tick } from 'svelte';
import { test } from '../../test';

// A fork's {#await} results (then and catch) must not end up in the real world
// unless the fork is committed
export default test({
	mode: ['client'],
	async test({ assert, target, instance }) {
		instance.resolve_all();
		await tick();
		assert.htmlEqual(target.innerHTML, '<q>0</q>');

		// resolved, then discarded
		let f = fork(() => instance.set_b(2));
		instance.resolve_all();
		await tick();
		assert.htmlEqual(target.innerHTML, '<q>0</q>');
		f.discard();
		await tick();
		assert.htmlEqual(target.innerHTML, '<q>0</q>');
		assert.equal(instance.pending(), 0); // no refetch in the real world

		// rejected, then discarded
		f = fork(() => instance.set_b(-1));
		instance.resolve_all();
		await tick();
		assert.htmlEqual(target.innerHTML, '<q>0</q>');
		f.discard();
		await tick();
		assert.htmlEqual(target.innerHTML, '<q>0</q>');

		// resolved, then committed
		f = fork(() => instance.set_b(3));
		instance.resolve_all();
		await tick();
		assert.htmlEqual(target.innerHTML, '<q>0</q>');
		await f.commit();
		assert.htmlEqual(target.innerHTML, '<q>3</q>');
		assert.equal(instance.pending(), 0);

		// rejected, then committed
		f = fork(() => instance.set_b(-2));
		instance.resolve_all();
		await tick();
		assert.htmlEqual(target.innerHTML, '<q>3</q>');
		await f.commit();
		assert.htmlEqual(target.innerHTML, '<s>-2</s>');

		// For comparison, a real update: without a pending snippet, the previous
		// content is removed (a microtask later), and the result shows once it resolves
		instance.set_b(4);
		await tick();
		assert.htmlEqual(target.innerHTML, '');
		instance.resolve_all();
		await tick();
		assert.htmlEqual(target.innerHTML, '<q>4</q>');

		// committed while pending (after the pending state was reached in the fork):
		// the real world is in the same state as after a real update
		f = fork(() => instance.set_b(5));
		await tick();
		assert.htmlEqual(target.innerHTML, '<q>4</q>');
		await f.commit();
		assert.htmlEqual(target.innerHTML, '');
		instance.resolve_all();
		await tick();
		assert.htmlEqual(target.innerHTML, '<q>5</q>');
		assert.equal(instance.pending(), 0);

		// committed synchronously (`fork` flushes synchronously, which reaches the pending state)
		f = fork(() => instance.set_b(6));
		assert.htmlEqual(target.innerHTML, '<q>5</q>');
		f.commit();
		assert.htmlEqual(target.innerHTML, '');
		instance.resolve_all();
		await tick();
		assert.htmlEqual(target.innerHTML, '<q>6</q>');
		assert.equal(instance.pending(), 0);

		// discarded while pending, resolved afterwards
		f = fork(() => instance.set_b(7));
		await tick();
		f.discard();
		instance.resolve_all();
		await tick();
		assert.htmlEqual(target.innerHTML, '<q>6</q>');
		assert.equal(instance.pending(), 0);
	}
});
