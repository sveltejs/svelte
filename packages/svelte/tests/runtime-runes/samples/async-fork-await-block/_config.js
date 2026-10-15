import { tick } from 'svelte';
import { test } from '../../test';

// A fork's {#await} results (then and catch) must not end up in the real world
// unless the fork is committed
export default test({
	mode: ['client'],
	async test({ assert, target, instance }) {
		const [input] = target.querySelectorAll('input');
		const [set, fork, resolve_all, discard, commit] = target.querySelectorAll('button');
		const [output] = target.querySelectorAll('#output');

		resolve_all.click();
		await tick();
		assert.htmlEqual(output.innerHTML, '<q>0</q>');

		const set_with = (/** @type {number} */ n) => {
			input.value = String(n);
			set.click();
		};

		const fork_with = (/** @type {number} */ n) => {
			input.value = String(n);
			fork.click();
		};

		// resolved, then discarded
		fork_with(2);
		resolve_all.click();
		await tick();
		assert.htmlEqual(output.innerHTML, '<q>0</q>');
		discard.click();
		await tick();
		assert.htmlEqual(output.innerHTML, '<q>0</q>');
		assert.equal(instance.registry.length, 0); // no refetch in the real world

		// rejected, then discarded
		fork_with(-1);
		resolve_all.click();
		await tick();
		assert.htmlEqual(output.innerHTML, '<q>0</q>');
		discard.click();
		await tick();
		assert.htmlEqual(output.innerHTML, '<q>0</q>');

		// resolved, then committed
		fork_with(3);
		resolve_all.click();
		await tick();
		assert.htmlEqual(output.innerHTML, '<q>0</q>');
		commit.click();
		await tick();
		assert.htmlEqual(output.innerHTML, '<q>3</q>');
		assert.equal(instance.registry.length, 0);

		// rejected, then committed
		fork_with(-2);
		resolve_all.click();
		await tick();
		assert.htmlEqual(output.innerHTML, '<q>3</q>');
		commit.click();
		await tick();
		assert.htmlEqual(output.innerHTML, '<s>-2</s>');

		// For comparison, a real update: without a pending snippet, the previous
		// content is removed (a microtask later), and the result shows once it resolves
		set_with(4);
		await tick();
		assert.htmlEqual(output.innerHTML, '');
		resolve_all.click();
		await tick();
		assert.htmlEqual(output.innerHTML, '<q>4</q>');

		// committed while pending (after the pending state was reached in the fork):
		// the real world is in the same state as after a real update
		fork_with(5);
		await tick();
		assert.htmlEqual(output.innerHTML, '<q>4</q>');
		commit.click();
		await tick();
		assert.htmlEqual(output.innerHTML, '');
		resolve_all.click();
		await tick();
		assert.htmlEqual(output.innerHTML, '<q>5</q>');
		assert.equal(instance.registry.length, 0);

		// committed synchronously (`fork` flushes synchronously, which reaches the pending state)
		fork_with(6);
		assert.htmlEqual(output.innerHTML, '<q>5</q>');
		commit.click();
		assert.htmlEqual(output.innerHTML, '');
		resolve_all.click();
		await tick();
		assert.htmlEqual(output.innerHTML, '<q>6</q>');
		assert.equal(instance.registry.length, 0);

		// discarded while pending, resolved afterwards
		fork_with(7);
		await tick();
		discard.click();
		resolve_all.click();
		await tick();
		assert.htmlEqual(output.innerHTML, '<q>6</q>');
		assert.equal(instance.registry.length, 0);
	}
});
