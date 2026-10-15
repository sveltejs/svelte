import { tick } from 'svelte';
import { test } from '../../test';

// A fork's {#await} results (then and catch) must not end up in the real world
// unless the fork is committed
export default test({
	mode: ['client'],
	async test({ assert, target, instance }) {
		const [
			fork_2,
			fork_negative_1,
			fork_3,
			fork_negative_2,
			fork_5,
			fork_6,
			fork_7,
			resolve_all,
			discard,
			commit,
			set_b_4
		] = target.querySelectorAll('button');
		const [output] = target.querySelectorAll('#output');

		resolve_all.click();
		await tick();
		assert.htmlEqual(output.innerHTML, '<q>0</q>');

		// resolved, then discarded
		fork_2.click();
		resolve_all.click();
		await tick();
		assert.htmlEqual(output.innerHTML, '<q>0</q>');
		discard.click();
		await tick();
		assert.htmlEqual(output.innerHTML, '<q>0</q>');
		assert.equal(instance.registry.length, 0); // no refetch in the real world

		// rejected, then discarded
		fork_negative_1.click();
		resolve_all.click();
		await tick();
		assert.htmlEqual(output.innerHTML, '<q>0</q>');
		discard.click();
		await tick();
		assert.htmlEqual(output.innerHTML, '<q>0</q>');

		// resolved, then committed
		fork_3.click();
		resolve_all.click();
		await tick();
		assert.htmlEqual(output.innerHTML, '<q>0</q>');
		commit.click();
		await tick();
		assert.htmlEqual(output.innerHTML, '<q>3</q>');
		assert.equal(instance.registry.length, 0);

		// rejected, then committed
		fork_negative_2.click();
		resolve_all.click();
		await tick();
		assert.htmlEqual(output.innerHTML, '<q>3</q>');
		commit.click();
		await tick();
		assert.htmlEqual(output.innerHTML, '<s>-2</s>');

		// For comparison, a real update: without a pending snippet, the previous
		// content is removed (a microtask later), and the result shows once it resolves
		set_b_4.click();
		await tick();
		assert.htmlEqual(output.innerHTML, '');
		resolve_all.click();
		await tick();
		assert.htmlEqual(output.innerHTML, '<q>4</q>');

		// committed while pending (after the pending state was reached in the fork):
		// the real world is in the same state as after a real update
		fork_5.click();
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
		fork_6.click();
		assert.htmlEqual(output.innerHTML, '<q>5</q>');
		commit.click();
		assert.htmlEqual(output.innerHTML, '');
		resolve_all.click();
		await tick();
		assert.htmlEqual(output.innerHTML, '<q>6</q>');
		assert.equal(instance.registry.length, 0);

		// discarded while pending, resolved afterwards
		fork_7.click();
		await tick();
		discard.click();
		resolve_all.click();
		await tick();
		assert.htmlEqual(output.innerHTML, '<q>6</q>');
		assert.equal(instance.registry.length, 0);
	}
});
