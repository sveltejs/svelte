import { fork, tick } from 'svelte';
import { test } from '../../test';

// A fork that is committed while it still waits for other async work (here: `<p>`) is a pending real batch:
// its {#await} promise is the real world's promise from then on, and as long as the batch is pending,
// the promise's states land along with the rest of the fork's state. Once the batch is done, they
// are their own batches again, like for any real update
export default test({
	mode: ['client'],
	async test({ assert, target, instance }) {
		instance.settle('p', 0);
		await tick();
		instance.settle('aw', 0);
		await tick();
		assert.htmlEqual(target.innerHTML, '<p>0</p><q>0</q>');

		// resolves before the batch is done; the real world's older promise is obsolete once the fork is committed
		instance.set({ a: 1 });
		await tick();
		assert.htmlEqual(target.innerHTML, '<p>0</p><i>pending</i>');
		let f = fork(() => instance.set({ b: 10 }));
		await tick();
		f.commit();
		await tick();
		instance.settle('aw', 11);
		await tick();
		assert.htmlEqual(target.innerHTML, '<p>0</p><i>pending</i>');
		instance.settle('aw', 1);
		await tick();
		assert.htmlEqual(target.innerHTML, '<p>0</p><i>pending</i>');
		instance.settle('p', 10);
		await tick();
		assert.htmlEqual(target.innerHTML, '<p>10</p><q>11</q>');

		// resolves after the batch is done
		f = fork(() => instance.set({ b: 20 }));
		await tick();
		f.commit();
		await tick();
		assert.htmlEqual(target.innerHTML, '<p>10</p><q>11</q>');
		instance.settle('p', 20);
		await tick();
		assert.htmlEqual(target.innerHTML, '<p>20</p><i>pending</i>');
		instance.settle('aw', 21);
		await tick();
		assert.htmlEqual(target.innerHTML, '<p>20</p><q>21</q>');

		// a real update after the commit supersedes the fork's promise
		f = fork(() => instance.set({ b: 30 }));
		await tick();
		f.commit();
		await tick();
		instance.set({ a: 2 });
		await tick();
		instance.settle('aw', 31);
		await tick();
		instance.settle('aw', 32);
		await tick();
		instance.settle('p', 30);
		await tick();
		assert.htmlEqual(target.innerHTML, '<p>30</p><q>32</q>');
	}
});
