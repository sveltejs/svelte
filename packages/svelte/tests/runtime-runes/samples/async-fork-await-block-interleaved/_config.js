import { fork, tick } from 'svelte';
import { test } from '../../test';

// Resolving a fork's {#await} promise must not interfere with real work happening at the same time
export default test({
	mode: ['client'],
	async test({ assert, target, instance }) {
		instance.settle('a', 0);
		instance.settle('b', 0);
		await tick();
		assert.htmlEqual(target.innerHTML, '<q>0</q><s>0|0</s>');

		// the real update's pending state is queued while the fork's promise resolves:
		// it must not end up in the fork
		let f = fork(() => instance.set({ b: 1 }));
		await tick();
		instance.set({ a: 1 });
		instance.settle('b', 1);
		await tick();
		assert.htmlEqual(target.innerHTML, '<i>pending</i><s>0|1</s>');
		f.discard();
		await tick();
		assert.htmlEqual(target.innerHTML, '<i>pending</i><s>0|1</s>');
		instance.settle('a', 1);
		await tick();
		assert.htmlEqual(target.innerHTML, '<q>1</q><s>0|1</s>');

		// a real update right after the fork's promise resolved (in the fork) must still show
		f = fork(() => instance.set({ b: 2 }));
		await tick();
		instance.latest('b').then(() => instance.set({ a: 5 }));
		instance.settle('b', 2);
		await tick();
		assert.htmlEqual(target.innerHTML, '<i>pending</i><s>0|5</s>');
		f.discard();
		instance.settle('a', 5);
		await tick();
		assert.htmlEqual(target.innerHTML, '<q>5</q><s>0|5</s>');
	}
});
