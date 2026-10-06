import { fork, tick } from 'svelte';
import { test } from '../../test';

// The pending state of a fork's {#await} promise, and its result, must not show in the real world unless
// the fork is committed. Real updates must keep working while a fork is alive, and a promise of the real
// world must still resolve in the real world when a fork re-runs the block
export default test({
	mode: ['client'],
	async test({ assert, target, instance }) {
		await tick();
		assert.htmlEqual(target.innerHTML, '<i>pending</i>');
		instance.settle(0);
		await tick();
		assert.htmlEqual(target.innerHTML, '<q>0</q>');

		// pending and resolved in the fork, then discarded
		let f = fork(() => instance.set({ b: 1 }));
		await tick();
		assert.htmlEqual(target.innerHTML, '<q>0</q>');
		instance.settle(1);
		await tick();
		assert.htmlEqual(target.innerHTML, '<q>0</q>');
		f.discard();
		await tick();
		assert.htmlEqual(target.innerHTML, '<q>0</q>');

		// rejected in the fork, then discarded
		f = fork(() => instance.set({ b: -1 }));
		instance.settle(-1);
		await tick();
		assert.htmlEqual(target.innerHTML, '<q>0</q>');
		f.discard();
		await tick();
		assert.htmlEqual(target.innerHTML, '<q>0</q>');

		// For comparison, a real update: pending, then resolved
		instance.set({ b: 2 });
		await tick();
		assert.htmlEqual(target.innerHTML, '<i>pending</i>');
		instance.settle(2);
		await tick();
		assert.htmlEqual(target.innerHTML, '<q>2</q>');

		// committed while pending: shows the pending state, just like a real update would
		f = fork(() => instance.set({ b: 3 }));
		await tick();
		assert.htmlEqual(target.innerHTML, '<q>2</q>');
		await f.commit();
		assert.htmlEqual(target.innerHTML, '<i>pending</i>');
		instance.settle(3);
		await tick();
		assert.htmlEqual(target.innerHTML, '<q>3</q>');

		// a real update while the fork is pending (a + b: real 4 + 3, fork 4 + 10)
		f = fork(() => instance.set({ b: 10 }));
		await tick();
		instance.set({ a: 4 });
		await tick();
		assert.htmlEqual(target.innerHTML, '<i>pending</i>');
		instance.settle(14);
		await tick();
		assert.htmlEqual(target.innerHTML, '<i>pending</i>');
		instance.settle(7);
		await tick();
		assert.htmlEqual(target.innerHTML, '<q>7</q>');
		instance.settle(10); // the fork's obsolete promise (from before it saw a = 4)
		await tick();
		assert.htmlEqual(target.innerHTML, '<q>7</q>');
		await f.commit();
		assert.htmlEqual(target.innerHTML, '<q>14</q>');

		// a real update while the fork is pending, then discarded (real 5 + 10, fork 5 + 20)
		f = fork(() => instance.set({ b: 20 }));
		await tick();
		instance.set({ a: 5 });
		await tick();
		assert.htmlEqual(target.innerHTML, '<i>pending</i>');
		instance.settle(15);
		instance.settle(25);
		await tick();
		assert.htmlEqual(target.innerHTML, '<q>15</q>');
		f.discard();
		await tick();
		assert.htmlEqual(target.innerHTML, '<q>15</q>');
		instance.settle(24);

		// a real promise that is still pending when a fork re-runs the block must resolve in the real world
		instance.set({ a: 6 });
		await tick();
		assert.htmlEqual(target.innerHTML, '<i>pending</i>');
		f = fork(() => instance.set({ b: 30 }));
		await tick();
		instance.settle(16);
		await tick();
		assert.htmlEqual(target.innerHTML, '<q>16</q>');
		f.discard();
		instance.settle(36);
		await tick();
		assert.htmlEqual(target.innerHTML, '<q>16</q>');

		// ...also when the fork's promise resolves first, and the fork is committed afterwards
		instance.set({ a: 7 });
		await tick();
		f = fork(() => instance.set({ b: 40 }));
		instance.settle(47);
		await tick();
		assert.htmlEqual(target.innerHTML, '<i>pending</i>');
		instance.settle(17);
		await tick();
		assert.htmlEqual(target.innerHTML, '<q>17</q>');
		await f.commit();
		assert.htmlEqual(target.innerHTML, '<q>47</q>');

		// ...but once the fork is committed, the real world's older promise is obsolete
		instance.set({ a: 8 });
		await tick();
		f = fork(() => instance.set({ b: 50 }));
		await tick();
		await f.commit();
		assert.htmlEqual(target.innerHTML, '<i>pending</i>');
		instance.settle(48);
		await tick();
		assert.htmlEqual(target.innerHTML, '<i>pending</i>');
		instance.settle(58);
		await tick();
		assert.htmlEqual(target.innerHTML, '<q>58</q>');

		// rejected in the fork, then committed
		f = fork(() => instance.set({ b: -60 }));
		instance.settle(-52);
		await tick();
		assert.htmlEqual(target.innerHTML, '<q>58</q>');
		await f.commit();
		assert.htmlEqual(target.innerHTML, '<s>-52</s>');
	}
});
