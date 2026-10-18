import { tick } from 'svelte';
import { test } from '../../test';

export default test({
	async test({ assert, raf, target }) {
		const [remove, remove_all, reset, restore, restore_pending] = target.querySelectorAll('button');
		const buttons = `
			<button>remove 2 and 3</button>
			<button>remove all</button>
			<button>reset</button>
			<button>restore 2</button>
			<button>restore 3</button>
		`;

		remove.click();
		await tick();
		raf.tick(200);

		// Even the synchronous outro stays in the DOM until the whole group finishes.
		assert.equal(target.querySelectorAll('p').length, 3);

		raf.tick(400);
		assert.htmlEqual(target.innerHTML, buttons + '<p>1</p>');

		reset.click();
		await tick();
		const restored = target.querySelectorAll('p')[1];

		remove_all.click();
		await tick();
		raf.tick(600);

		// Resuming a completed item removes it from the group's done set.
		restore.click();
		await tick();
		raf.tick(800);

		assert.htmlEqual(target.innerHTML, buttons + '<p>2</p>');
		assert.equal(target.querySelector('p'), restored);

		// An all-synchronous group still gets destroyed immediately.
		remove_all.click();
		await tick();
		assert.htmlEqual(target.innerHTML, buttons);

		reset.click();
		await tick();
		const pending = target.querySelectorAll('p')[2];
		remove.click();
		await tick();
		raf.tick(1000);

		// Reviving the last pending item destroys its completed sibling immediately,
		// without relying on a transition callback to empty the group.
		restore_pending.click();
		await tick();
		assert.deepEqual(
			Array.from(target.querySelectorAll('p'), (p) => p.textContent),
			['1', '3']
		);
		assert.equal(target.querySelectorAll('p')[1], pending);

		// A subsequent removal must not be affected by the cancelled group's callback.
		remove_all.click();
		await tick();
		raf.tick(1400);
		assert.htmlEqual(target.innerHTML, buttons);
	}
});
