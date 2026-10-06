import { fork, tick } from 'svelte';
import { test } from '../../test';

// An {#await} block without dependencies can't re-run, so it is the same in every batch: if it's
// created in a fork, a real batch that adopts the fork's branch must see its states as well
export default test({
	mode: ['client'],
	async test({ assert, target, instance }) {
		const f = fork(() => instance.set({ show: true, x: 1 }));
		await tick();
		assert.htmlEqual(target.innerHTML, '<p>0</p>');

		instance.set({ show: true });
		await tick();
		assert.htmlEqual(target.innerHTML, '<i>pending</i><p>0</p>');

		instance.settle(5);
		await tick();
		assert.htmlEqual(target.innerHTML, '<q>5</q><p>0</p>');

		f.discard();
		await tick();
		assert.htmlEqual(target.innerHTML, '<q>5</q><p>0</p>');
	}
});
