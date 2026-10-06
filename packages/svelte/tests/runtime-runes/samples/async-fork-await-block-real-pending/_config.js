import { fork, tick } from 'svelte';
import { test } from '../../test';

// A fork re-running an {#await} block must not make the real world's pending promise obsolete
export default test({
	mode: ['client'],
	async test({ assert, target, instance }) {
		await tick();
		assert.htmlEqual(target.innerHTML, '<i>pending</i>');

		const f = fork(() => instance.set_b(1));
		await tick();

		instance.settle(0);
		await tick();
		assert.htmlEqual(target.innerHTML, '<q>0</q>');

		f.discard();
		instance.settle(1);
		await tick();
		assert.htmlEqual(target.innerHTML, '<q>0</q>');
	}
});
